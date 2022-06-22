import { expect } from 'chai';
import { downloadFile } from "../src/backend/downloads.js";
import * as mockery from 'mockery';

class FakeAxios {
    async get(URL) {
        // regex the url - if it is poorly formed, throw an error.
        const URL_regex = 'https:\/\/storage\.googleapis\.com\/([a-zA-Z]+(-[a-zA-Z]+)+)[0-9]+\/[0-9]+([a-zA-Z]+(\.[a-zA-Z]+)+)';
        if (!URL.match(URL_regex)) {
            throw 'URL is not well defined';
        }
        else {
            setTimeout(() => { }, 5000);
        }
    }
}

let currTime = 0;
class FakeDate {
    now() {
        currTime += 1;
        return currTime;
    }
}

describe('downloads', () => {

    before(() => {
        mockery.registerMock('axios', { default: FakeAxios });
        mockery.registerMock('Date', { default: FakeDate });
        mockery.enable({ useCleanCache: true, warnOnUnregistered: false });
    });

    beforeEach(() => {
        currTime = 0;
    })

    after(() => {
        mockery.deregisterAll();
        mockery.disable();
    });

    describe('downloadFile', () => {
        it('should return -1 on failure', async () => {
            const URL = 'poorly_formed_URL';
            const result = await downloadFile(URL);
            expect(result).to.equal(-1)
        });

        it('should return non-negative number on success', async () => {
            const URL = 'https://storage.googleapis.com/gcsrbpa-us-west1/2mib.txt';
            const result = await downloadFile(URL);
            expect(result).to.greaterThan(0)
        })
    })

})
