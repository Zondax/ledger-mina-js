const { TestEnvironment } = require('jest-environment-jsdom');
const { JestEnvironmentConfig, EnvironmentContext } = require('@jest/environment');
const jestMock = require('jest-mock');

class ExtensionEnvironment extends TestEnvironment {
    constructor(config: typeof JestEnvironmentConfig, context: typeof EnvironmentContext) {
        super(config, context);
    }

    async setup() {
        await super.setup();
        
        // Add extension-specific globals
        this.global.chrome = {
            runtime: {
                id: 'test-extension-id',
                getURL: (path: string) => `chrome-extension://test-extension-id/${path}`,
            },
            tabs: {
                create: jestMock.fn(),
                query: jestMock.fn(),
            },
            storage: {
                local: {
                    get: jestMock.fn(),
                    set: jestMock.fn(),
                },
            },
        };

        // Add WebUSB API
        this.global.navigator = {
            ...this.global.navigator,
            usb: {
                requestDevice: jestMock.fn(),
                getDevices: jestMock.fn(),
            },
        };
    }
}

module.exports = ExtensionEnvironment; 
