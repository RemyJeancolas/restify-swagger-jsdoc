import {expect} from 'chai';
import * as sinon from 'sinon';
import * as path from 'path';
import * as fs from 'fs';
import * as swaggerJsDoc from 'swagger-jsdoc';
import * as swaggerDoc from '../src/index';

let sandbox: sinon.SinonSandbox;
const server: any = {get: Function};
const req: any = {params: ['foo'], headers: { host: 'baz'}, isSecure: Function};
const res: any = {setHeader: Function, send: Function, write: Function, end: Function};
let next: sinon.SinonSpyStatic;

describe('restify-swagger-jsdoc', () => {
    before(() => {
        sandbox = sinon.sandbox.create();
        next = sandbox.spy();
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('createSwaggerPage', () => {
        const options: any = {};
        expect(() => swaggerDoc.createSwaggerPage(options)).to.throw('options.title is required');

        options.title = 'foo';
        expect(() => swaggerDoc.createSwaggerPage(options)).to.throw('options.version is required');

        options.version = '1.0.0';
        expect(() => swaggerDoc.createSwaggerPage(options)).to.throw('options.server is required');

        sandbox.stub(server, 'get').callsFake((url: string|RegExp, callback: (...args: any[]) => any) => {
            callback(req, res, next);
        });
        const setHeaderStub = sandbox.stub(res, 'setHeader');
        const sendStub = sandbox.stub(res, 'send');
        const readFileStub = sandbox.stub(fs, 'readFile').callsFake((path: string, callback: (e: Error, content?: any) => any) => {
            callback(new Error('Foo'));
        });
        options.server = server;
        expect(() => swaggerDoc.createSwaggerPage(options)).to.throw('options.path is required');

        options.path = '/swagger';
        swaggerDoc.createSwaggerPage(options);
        expect(setHeaderStub.callCount).to.equal(2);
        expect(setHeaderStub.firstCall.args).to.deep.equal(['Content-type', 'application/json']);
        expect(setHeaderStub.secondCall.args).to.deep.equal(['Location', '/swagger/index.html']);
        expect(sendStub.callCount).to.equal(2);
        expect(sendStub.lastCall.args).to.deep.equal([302]);
        expect(readFileStub.callCount).to.equal(1);

        readFileStub.callsFake((path: string, callback: (e: Error, content?: any) => any) => {
            callback(null, new Buffer('url: "http://petstore.swagger.io/v2/swagger.json"'));
        });
        const writeStub = sandbox.stub(res, 'write');
        const endStub = sandbox.stub(res, 'end');
        options.definitions = {foo: 'bar'};
        expect(() => swaggerDoc.createSwaggerPage(options)).to.not.throw();
        expect(writeStub.callCount).to.equal(1);
        expect(writeStub.lastCall.args[0].toString()).to.equal('url: "http://petstore.swagger.io/v2/swagger.json"');
        expect(endStub.callCount).to.equal(1);

        const isSecureStub = sandbox.stub(req, 'isSecure').returns(true);
        req.params[0] = 'index.html';
        options.apis = [path.join(__dirname, 'mock', '*.ts')];
        options.routePrefix = 'bar';
        expect(() => swaggerDoc.createSwaggerPage(options)).to.not.throw();
        expect(writeStub.callCount).to.equal(2);
        expect(writeStub.lastCall.args[0].toString()).to.equal('url: "https://baz/swagger/swagger.json"');
        expect(endStub.callCount).to.equal(2);

        isSecureStub.returns(false);
        expect(() => swaggerDoc.createSwaggerPage(options)).to.not.throw();
        expect(writeStub.callCount).to.equal(3);
        expect(writeStub.lastCall.args[0].toString()).to.equal('url: "http://baz/swagger/swagger.json"');
        expect(endStub.callCount).to.equal(3);
    });
});
