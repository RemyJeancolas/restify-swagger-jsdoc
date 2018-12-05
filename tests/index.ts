import { expect } from 'chai';
import * as sinon from 'sinon';
import * as path from 'path';
import * as fs from 'fs';
import * as mime from 'mime-types';
import * as swaggerDoc from '../src/index';

let sandbox: sinon.SinonSandbox;
const server: any = {get: Function};
const options: any = {title: 'foo', version: '1.0.0', server, path: '/swagger'};
const res: any = {setHeader: Function, send: Function, write: Function, end: Function};

describe('restify-swagger-jsdoc', () => {
    before(() => {
        sandbox = sinon.sandbox.create();
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('createSwaggerPage()', () => {
        it('should throw errors if options are invalid', () => {
            const opts: any = {};
            expect(() => swaggerDoc.createSwaggerPage(opts)).to.throw('options.title is required');

            opts.title = 'foo';
            expect(() => swaggerDoc.createSwaggerPage(opts)).to.throw('options.version is required');

            opts.version = '1.0.0';
            expect(() => swaggerDoc.createSwaggerPage(opts)).to.throw('options.server is required');

            opts.server = server;
            expect(() => swaggerDoc.createSwaggerPage(opts)).to.throw('options.path is required');
        });

        it('should add an endpoint to serve swagger json file', () => {
            const getStub = sandbox.stub(server, 'get');
            swaggerDoc.createSwaggerPage(options);

            expect(getStub.callCount).to.equal(3);
            const callback: Function = getStub.firstCall.args[1];
            const next = sandbox.spy();
            const setHeaderStub = sandbox.stub(res, 'setHeader');
            const sendStub = sandbox.stub(res, 'send');
            callback(null, res, next);

            expect(setHeaderStub.callCount).to.equal(1);
            expect(setHeaderStub.lastCall.args).to.deep.equal(['Content-type', 'application/json']);
            expect(sendStub.callCount).to.equal(1);
            expect(next.callCount).to.equal(1);
        });

        it('should add an endpoint to redirect to main index file', () => {
            const getStub = sandbox.stub(server, 'get');
            swaggerDoc.createSwaggerPage(options);

            expect(getStub.callCount).to.equal(3);
            const callback: Function = getStub.secondCall.args[1];
            const next = sandbox.spy();
            const setHeaderStub = sandbox.stub(res, 'setHeader');
            const sendStub = sandbox.stub(res, 'send');
            callback(null, res, next);

            expect(setHeaderStub.callCount).to.equal(1);
            expect(setHeaderStub.lastCall.args).to.deep.equal(['Location', `${options.path}/index.html`]);
            expect(sendStub.callCount).to.equal(1);
            expect(sendStub.lastCall.args).to.deep.equal([302]);
            expect(next.callCount).to.equal(1);
        });

        describe('Swagger UI files endpoint', () => {
            it('should throw a 404 error if the requested file doesn\'t exist', () => {
                const serverGetStub = sandbox.stub(server, 'get');
                const dirnameStub = sandbox.stub(path, 'dirname').returns('baz');
                swaggerDoc.createSwaggerPage(options);

                expect(dirnameStub.callCount).to.equal(1);
                expect(serverGetStub.callCount).to.equal(3);
                const callback: Function = serverGetStub.thirdCall.args[1];
                const next = sandbox.spy();
                const resolveStub = sandbox.stub(path, 'resolve').returns('foo');
                const readFileStub = sandbox.stub(fs, 'readFile').callsFake((p: string, cb: (err: Error, content?: string) => void) => {
                    cb(new Error('Foo'));
                });
                callback({params: {'*': 'bar'}}, null, next);

                expect(resolveStub.callCount).to.equal(1);
                expect(resolveStub.lastCall.args).to.deep.equal(['baz', 'bar']);
                expect(readFileStub.callCount).to.equal(1);
                expect(next.callCount).to.equal(1);
                expect(next.lastCall.args[0].message).to.equal('File bar does not exist');
            });

            it('should send a file if existing', () => {
                const getStub = sandbox.stub(server, 'get');
                const dirnameStub = sandbox.stub(path, 'dirname').returns('baz');
                swaggerDoc.createSwaggerPage(options);

                expect(dirnameStub.callCount).to.equal(1);
                expect(getStub.callCount).to.equal(3);
                const callback: Function = getStub.thirdCall.args[1];
                const next = sandbox.spy();
                const lookupStub = sandbox.stub(mime, 'lookup').returns(false);
                const writeStub = sandbox.stub(res, 'write');
                const endStub = sandbox.stub(res, 'end');
                sandbox.stub(path, 'resolve').returns('foo');
                sandbox.stub(fs, 'readFile').callsFake((filePath: string, cb: (err: Error, content?: string) => void) => {
                    cb(null, 'Foo');
                });
                callback({params: {'*': 'bar'}}, res, next);

                expect(lookupStub.callCount).to.equal(1);
                expect(lookupStub.lastCall.args).to.deep.equal(['bar']);
                expect(writeStub.callCount).to.equal(1);
                expect(writeStub.lastCall.args).to.deep.equal(['Foo']);
                expect(endStub.callCount).to.equal(1);
                expect(next.callCount).to.equal(1);
            });

            it('should send the correct content type if found', () => {
                const getStub = sandbox.stub(server, 'get');
                const dirnameStub = sandbox.stub(path, 'dirname').returns('baz');
                swaggerDoc.createSwaggerPage(options);

                expect(dirnameStub.callCount).to.equal(1);
                expect(getStub.callCount).to.equal(3);
                const callback: Function = getStub.thirdCall.args[1];
                const next = sandbox.spy();
                const lookupStub = sandbox.stub(mime, 'lookup').returns('foobar');
                const setHeaderStub = sandbox.stub(res, 'setHeader');
                const writeStub = sandbox.stub(res, 'write');
                const endStub = sandbox.stub(res, 'end');
                sandbox.stub(path, 'resolve').returns('foo');
                sandbox.stub(fs, 'readFile').callsFake((filePath: string, cb: (err: Error, content?: string) => void) => {
                    cb(null, 'Foo');
                });
                callback({params: {'*': 'bar'}}, res, next);

                expect(lookupStub.callCount).to.equal(1);
                expect(lookupStub.lastCall.args).to.deep.equal(['bar']);
                expect(setHeaderStub.callCount).to.equal(1);
                expect(setHeaderStub.lastCall.args).to.deep.equal(['Content-Type', 'foobar']);
                expect(writeStub.callCount).to.equal(1);
                expect(writeStub.lastCall.args).to.deep.equal(['Foo']);
                expect(endStub.callCount).to.equal(1);
                expect(next.callCount).to.equal(1);
            });

            it('should overwrite Swagger UI index page with its own json file', () => {
                const getStub = sandbox.stub(server, 'get');
                const dirnameStub = sandbox.stub(path, 'dirname').returns('baz');
                swaggerDoc.createSwaggerPage(options);

                expect(dirnameStub.callCount).to.equal(1);
                expect(getStub.callCount).to.equal(3);
                const callback: Function = getStub.thirdCall.args[1];
                const next = sandbox.spy();
                const lookupStub = sandbox.stub(mime, 'lookup').returns('foobar');
                const setHeaderStub = sandbox.stub(res, 'setHeader');
                const writeStub = sandbox.stub(res, 'write');
                const endStub = sandbox.stub(res, 'end');
                sandbox.stub(path, 'resolve').returns('foo');
                sandbox.stub(fs, 'readFile').callsFake((filePath: string, cb: (err: Error, content?: string) => void) => {
                    cb(null, 'url: "https://petstore.swagger.io/v2/swagger.json"');
                });
                callback({params: {'*': 'index.html'}, isSecure: () => false, headers: {host: 'host'}}, res, next);

                expect(lookupStub.callCount).to.equal(1);
                expect(lookupStub.lastCall.args).to.deep.equal(['index.html']);
                expect(setHeaderStub.callCount).to.equal(1);
                expect(setHeaderStub.lastCall.args).to.deep.equal(['Content-Type', 'foobar']);
                expect(writeStub.callCount).to.equal(1);
                expect(writeStub.lastCall.args[0].toString()).to.equal(`url: "http://host${options.path}/swagger.json"`);
                expect(endStub.callCount).to.equal(1);
                expect(next.callCount).to.equal(1);
            });

            it('should send json file over https if options.forceSecure or req.isSecure() === true', () => {
                const getStub = sandbox.stub(server, 'get');
                const dirnameStub = sandbox.stub(path, 'dirname').returns('baz');
                swaggerDoc.createSwaggerPage(options);

                expect(dirnameStub.callCount).to.equal(1);
                expect(getStub.callCount).to.equal(3);
                const callback: Function = getStub.thirdCall.args[1];
                const next = sandbox.spy();
                const lookupStub = sandbox.stub(mime, 'lookup').returns('foobar');
                const setHeaderStub = sandbox.stub(res, 'setHeader');
                const writeStub = sandbox.stub(res, 'write');
                const endStub = sandbox.stub(res, 'end');
                sandbox.stub(path, 'resolve').returns('foo');
                sandbox.stub(fs, 'readFile').callsFake((filePath: string, cb: (err: Error, content?: string) => void) => {
                    cb(null, 'url: "https://petstore.swagger.io/v2/swagger.json"');
                });
                callback({params: {'*': 'index.html'}, isSecure: () => true, headers: {host: 'host'}}, res, next);

                expect(lookupStub.callCount).to.equal(1);
                expect(lookupStub.lastCall.args).to.deep.equal(['index.html']);
                expect(setHeaderStub.callCount).to.equal(1);
                expect(setHeaderStub.lastCall.args).to.deep.equal(['Content-Type', 'foobar']);
                expect(writeStub.callCount).to.equal(1);
                expect(writeStub.lastCall.args[0].toString()).to.equal(`url: "https://host${options.path}/swagger.json"`);
                expect(endStub.callCount).to.equal(1);
                expect(next.callCount).to.equal(1);
            });
        });

        it('should set default parameters if optional options are missing', () => {
            const getStub = sandbox.stub(server, 'get');
            swaggerDoc.createSwaggerPage(options);
            expect(getStub.callCount).to.equal(3);

            const callback: Function = getStub.firstCall.args[1];
            sandbox.spy();
            sandbox.stub(res, 'setHeader');
            const sendStub = sandbox.stub(res, 'send');
            callback(null, res, sandbox.spy());

            expect(sendStub.callCount).to.equal(1);
            expect(sendStub.lastCall.args[0]).to.deep.equal({
                info: { title: options.title, version: options.version },
                basePath: '/',
                tags: [],
                openapi: '3.0.0',
                paths: {},
                components: {},
            }, 'Params should be as expected');
        });

        it('should use optional options if provided', () => {
            const localOptions: any = Object.assign({
                description: 'd',
                host: 'h',
                routePrefix: 'p',
                schemes: [],
                tags: [],
                apis: [],
                components: {foo: 'bar'}
            }, options);
            const getStub = sandbox.stub(server, 'get');
            swaggerDoc.createSwaggerPage(localOptions);
            expect(getStub.callCount).to.equal(3);

            const callback: Function = getStub.firstCall.args[1];
            sandbox.spy();
            sandbox.stub(res, 'setHeader');
            const sendStub = sandbox.stub(res, 'send');
            callback(null, res, sandbox.spy());

            expect(sendStub.callCount).to.equal(1);
            expect(sendStub.lastCall.args[0]).to.deep.equal({
                info: { title: options.title, version: options.version, description: 'd' },
                host: 'h',
                basePath: '/p',
                schemes: [],
                tags: [],
                openapi: '3.0.0',
                paths: {},
                components: {foo: 'bar'}
            });
        });

        // sandbox.stub(server, 'get').callsFake((url: string|RegExp, callback: (...args: any[]) => any) => {
        //     callback(req, res, next);
        // });
        // const setHeaderStub = sandbox.stub(res, 'setHeader');
        // const sendStub = sandbox.stub(res, 'send');
        // const readFileStub = sandbox.stub(fs, 'readFile').callsFake((p: string, callback: (e: Error, content?: any) => any) => {
        //     callback(new Error('Foo'));
        // });
        // options.server = server;
        // expect(() => swaggerDoc.createSwaggerPage(options)).to.throw('options.path is required');

        // options.path = '/swagger';
        // swaggerDoc.createSwaggerPage(options);
        // expect(setHeaderStub.callCount).to.equal(2);
        // expect(setHeaderStub.firstCall.args).to.deep.equal(['Content-type', 'application/json']);
        // expect(setHeaderStub.secondCall.args).to.deep.equal(['Location', '/swagger/index.html']);
        // expect(sendStub.callCount).to.equal(2);
        // expect(sendStub.lastCall.args).to.deep.equal([302]);
        // expect(readFileStub.callCount).to.equal(1);

        // readFileStub.callsFake((p: string, callback: (e: Error, content?: any) => any) => {
        //     callback(null, new Buffer('url: "https://petstore.swagger.io/v2/swagger.json"'));
        // });
        // const writeStub = sandbox.stub(res, 'write');
        // const endStub = sandbox.stub(res, 'end');
        // options.definitions = {foo: 'bar'};
        // expect(() => swaggerDoc.createSwaggerPage(options)).to.not.throw();
        // expect(writeStub.callCount).to.equal(1);
        // expect(writeStub.lastCall.args[0].toString()).to.equal('url: "https://petstore.swagger.io/v2/swagger.json"');
        // expect(endStub.callCount).to.equal(1);

        // const isSecureStub = sandbox.stub(req, 'isSecure').returns(true);
        // req.params[0] = 'index.html';
        // options.apis = [path.join(__dirname, 'mock', '*.ts')];
        // options.routePrefix = 'bar';
        // expect(() => swaggerDoc.createSwaggerPage(options)).to.not.throw();
        // expect(writeStub.callCount).to.equal(2);
        // expect(writeStub.lastCall.args[0].toString()).to.equal('url:"https://baz/swagger/swagger.json"');
        // expect(endStub.callCount).to.equal(2);

        // isSecureStub.returns(false);
        // expect(() => swaggerDoc.createSwaggerPage(options)).to.not.throw();
        // expect(writeStub.callCount).to.equal(3);
        // expect(writeStub.lastCall.args[0].toString()).to.equal('url:"http://baz/swagger/swagger.json"');
        // expect(endStub.callCount).to.equal(3);
    });
});
