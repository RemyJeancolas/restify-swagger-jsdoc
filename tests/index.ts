import { expect } from 'chai';
import * as sinon from 'sinon';
import * as path from 'path';
import * as fs from 'fs';
import * as mime from 'mime-types';
import * as swaggerDoc from '../src/index';

describe('restify-swagger-jsdoc', () => {
  const swaggerUiPath = `${path.dirname(require.resolve('swagger-ui-dist'))}${path.sep}`;
  const sandbox = sinon.createSandbox();
  const server: any = {get: Function};
  const options: any = {title: 'foo', version: '1.0.0', server, path: '/swagger'};
  const res: any = {setHeader: Function, send: Function, write: Function, end: Function};

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
        const dirnameStub = sandbox.stub(path, 'dirname').returns(swaggerUiPath);
        swaggerDoc.createSwaggerPage(options);

        expect(dirnameStub.callCount).to.equal(1);
        expect(serverGetStub.callCount).to.equal(3);
        const callback: Function = serverGetStub.thirdCall.args[1];
        const next = sandbox.spy();
        const resolveStub = sandbox.stub(path, 'resolve').returns(path.join(swaggerUiPath, 'bar'));
        const readFileStub = sandbox.stub(fs, 'readFile').callsFake((p: string, cb: (err: Error, content?: string) => void) => {
          cb(new Error('Foo'));
        });
        callback({params: {'*': 'bar'}}, null, next);

        expect(resolveStub.callCount).to.equal(1);
        expect(resolveStub.lastCall.args).to.deep.equal([swaggerUiPath, 'bar']);
        expect(readFileStub.callCount).to.equal(1);
        expect(next.callCount).to.equal(1);
        expect(next.lastCall.args[0].message).to.equal('File bar does not exist');
      });

      it('should throw a 404 error if the requested file is outside the swagger ui directory', () => {
        const serverGetStub = sandbox.stub(server, 'get');
        const dirnameStub = sandbox.stub(path, 'dirname').returns(swaggerUiPath);
        swaggerDoc.createSwaggerPage(options);

        expect(dirnameStub.callCount).to.equal(1);
        expect(serverGetStub.callCount).to.equal(3);
        const callback: Function = serverGetStub.thirdCall.args[1];
        const next = sandbox.spy();
        const resolveSpy = sandbox.spy(path, 'resolve');
        const readFileStub = sandbox.stub(fs, 'readFile').callsFake((p: string, cb: (err: Error, content?: string) => void) => {
          cb(new Error('Foo'));
        });
        callback({params: {'*': '../foo'}}, null, next);

        expect(resolveSpy.callCount).to.equal(1);
        expect(resolveSpy.lastCall.args).to.deep.equal([swaggerUiPath, '../foo']);
        expect(readFileStub.callCount).to.equal(0);
        expect(next.callCount).to.equal(1);
        expect(next.lastCall.args[0].message).to.equal('File ../foo does not exist');
      });

      it('should send a file if existing', () => {
        const getStub = sandbox.stub(server, 'get');
        const dirnameStub = sandbox.stub(path, 'dirname').returns(swaggerUiPath);
        swaggerDoc.createSwaggerPage(options);

        expect(dirnameStub.callCount).to.equal(1);
        expect(getStub.callCount).to.equal(3);
        const callback: Function = getStub.thirdCall.args[1];
        const next = sandbox.spy();
        const lookupStub = sandbox.stub(mime, 'lookup').returns(false);
        const writeStub = sandbox.stub(res, 'write');
        const endStub = sandbox.stub(res, 'end');
        sandbox.stub(path, 'resolve').returns(path.join(swaggerUiPath, 'bar'));
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
        const dirnameStub = sandbox.stub(path, 'dirname').returns(swaggerUiPath);
        swaggerDoc.createSwaggerPage(options);

        expect(dirnameStub.callCount).to.equal(1);
        expect(getStub.callCount).to.equal(3);
        const callback: Function = getStub.thirdCall.args[1];
        const next = sandbox.spy();
        const lookupStub = sandbox.stub(mime, 'lookup').returns('foobar');
        const setHeaderStub = sandbox.stub(res, 'setHeader');
        const writeStub = sandbox.stub(res, 'write');
        const endStub = sandbox.stub(res, 'end');
        sandbox.stub(path, 'resolve').returns(path.join(swaggerUiPath, 'bar'));
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
        const dirnameStub = sandbox.stub(path, 'dirname').returns(swaggerUiPath);
        swaggerDoc.createSwaggerPage(options);

        expect(dirnameStub.callCount).to.equal(1);
        expect(getStub.callCount).to.equal(3);
        const callback: Function = getStub.thirdCall.args[1];
        const next = sandbox.spy();
        const lookupStub = sandbox.stub(mime, 'lookup').returns('foobar');
        const setHeaderStub = sandbox.stub(res, 'setHeader');
        const writeStub = sandbox.stub(res, 'write');
        const endStub = sandbox.stub(res, 'end');
        sandbox.stub(path, 'resolve').returns(path.join(swaggerUiPath, 'bar'));
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

      it('should overwrite validatorUrl if provided', () => {
        const localOptions = {...options, validatorUrl: null};
        const getStub = sandbox.stub(server, 'get');
        const dirnameStub = sandbox.stub(path, 'dirname').returns(swaggerUiPath);
        swaggerDoc.createSwaggerPage(localOptions);

        expect(dirnameStub.callCount).to.equal(1);
        expect(getStub.callCount).to.equal(3);
        const callback: Function = getStub.thirdCall.args[1];
        const next = sandbox.spy();
        const lookupStub = sandbox.stub(mime, 'lookup').returns('foobar');
        const setHeaderStub = sandbox.stub(res, 'setHeader');
        const writeStub = sandbox.stub(res, 'write');
        const endStub = sandbox.stub(res, 'end');
        sandbox.stub(path, 'resolve').returns(path.join(swaggerUiPath, 'bar'));
        sandbox.stub(fs, 'readFile').callsFake((filePath: string, cb: (err: Error, content?: string) => void) => {
          cb(null, 'layout: "StandaloneLayout"');
        });
        callback({params: {'*': 'index.html'}, isSecure: () => false, headers: {host: 'host'}}, res, next);

        expect(lookupStub.callCount).to.equal(1);
        expect(lookupStub.lastCall.args).to.deep.equal(['index.html']);
        expect(setHeaderStub.callCount).to.equal(1);
        expect(setHeaderStub.lastCall.args).to.deep.equal(['Content-Type', 'foobar']);
        expect(writeStub.callCount).to.equal(1);
        // tslint:disable-next-line:chai-vague-errors
        expect(writeStub.lastCall.args[0].toString()).to.equal(`layout: "StandaloneLayout",\n${' '.repeat(8)}validatorUrl: null`);
        expect(endStub.callCount).to.equal(1);
        expect(next.callCount).to.equal(1);

        localOptions.validatorUrl = 'foo';
        callback({params: {'*': 'index.html'}, isSecure: () => false, headers: {host: 'host'}}, res, next);
        expect(writeStub.callCount).to.equal(2);
        expect(writeStub.lastCall.args[0].toString()).to.equal(`layout: "StandaloneLayout",\n${' '.repeat(8)}validatorUrl: "foo"`);
      });

      it('should handle supportedSubmitMethods if provided', () => {
        const localOptions = {...options, supportedSubmitMethods: []};
        const getStub = sandbox.stub(server, 'get');
        const dirnameStub = sandbox.stub(path, 'dirname').returns(swaggerUiPath);
        swaggerDoc.createSwaggerPage(localOptions);

        expect(dirnameStub.callCount).to.equal(1);
        expect(getStub.callCount).to.equal(3);
        const callback: Function = getStub.thirdCall.args[1];
        const next = sandbox.spy();
        const lookupStub = sandbox.stub(mime, 'lookup').returns('foobar');
        const setHeaderStub = sandbox.stub(res, 'setHeader');
        const writeStub = sandbox.stub(res, 'write');
        const endStub = sandbox.stub(res, 'end');
        sandbox.stub(path, 'resolve').returns(path.join(swaggerUiPath, 'bar'));
        sandbox.stub(fs, 'readFile').callsFake((filePath: string, cb: (err: Error, content?: string) => void) => {
          cb(null, 'layout: "StandaloneLayout"');
        });
        callback({params: {'*': 'index.html'}, isSecure: () => false, headers: {host: 'host'}}, res, next);

        expect(lookupStub.callCount).to.equal(1);
        expect(lookupStub.lastCall.args).to.deep.equal(['index.html']);
        expect(setHeaderStub.callCount).to.equal(1);
        expect(setHeaderStub.lastCall.args).to.deep.equal(['Content-Type', 'foobar']);
        expect(writeStub.callCount).to.equal(1);
        // tslint:disable-next-line:chai-vague-errors
        expect(writeStub.lastCall.args[0].toString()).to.equal(`layout: "StandaloneLayout",\n${' '.repeat(8)}supportedSubmitMethods: []`);
        expect(endStub.callCount).to.equal(1);
        expect(next.callCount).to.equal(1);
      });

      it('should send json file over https if options.forceSecure or req.isSecure() === true', () => {
        const getStub = sandbox.stub(server, 'get');
        const dirnameStub = sandbox.stub(path, 'dirname').returns(swaggerUiPath);
        swaggerDoc.createSwaggerPage(options);

        expect(dirnameStub.callCount).to.equal(1);
        expect(getStub.callCount).to.equal(3);
        const callback: Function = getStub.thirdCall.args[1];
        const next = sandbox.spy();
        const lookupStub = sandbox.stub(mime, 'lookup').returns('foobar');
        const setHeaderStub = sandbox.stub(res, 'setHeader');
        const writeStub = sandbox.stub(res, 'write');
        const endStub = sandbox.stub(res, 'end');
        sandbox.stub(path, 'resolve').returns(path.join(swaggerUiPath, 'bar'));
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
        swagger: '2.0',
        paths: {},
        definitions: {},
        responses: {},
        parameters: {}
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
        definitions: {foo: 'bar'},
        securityDefinitions: {
          basic: {
            type: 'basic'
          }
        }
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
        swagger: '2.0',
        paths: {},
        definitions: {foo: 'bar'},
        securityDefinitions: {
          basic: {
            type: 'basic'
          }
        },
        responses: {},
        parameters: {}
      });
    });
  });
});
