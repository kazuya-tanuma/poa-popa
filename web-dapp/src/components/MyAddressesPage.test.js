import React from 'react';
import { mount } from 'enzyme';

import MyAddressesPage from './MyAddressesPage';
import * as waitForTransaction from '../waitForTransaction';

const web3 = { eth: { accounts: ['0x1aa2d288d03d8397c193d2327ee7a7443d4ec3a1'] } };

const sleep = (timeout = 0) => new Promise(resolve => setTimeout(resolve, timeout))

describe('<MyAddressesPage />', () => {
    it('renders correctly', () => {
        const contractMock = buildContractMock()
        const page = mount(<MyAddressesPage my_web3={web3} contract={contractMock}/>);

        expect(page.root()).toHaveLength(1);
        expect(page.find('.my-addresses')).toHaveLength(1);
    });

    it('renders addresses', async () => {
        const contractMock = buildContractMock({ count: 2 })
        const page = mount(<MyAddressesPage my_web3={web3} contract={contractMock}/>);

        await sleep()
        expect(page.state('addresses').length).toBe(2)
    })

    it('should reload page after removing an address', (done) => {
        const reloadSpy = jest.spyOn(window.location, 'reload').mockImplementation(() => {})
        const contractMock = buildContractMock({ count: 2 })
        const page = mount(<MyAddressesPage my_web3={web3} contract={contractMock}/>);

        waitForTransaction.default = jest.fn().mockImplementationOnce(() => Promise.resolve())

        const e = { preventDefault: jest.fn() }
        page.instance().remove(e, 'country', 'state', 'city', 'location', 'zip')

        setTimeout(() => {
            expect(reloadSpy).toHaveBeenCalled()

            reloadSpy.mockReset()
            reloadSpy.mockRestore()
            done();
        })
    })
});

function buildContractMock(params = { count: 0 }, extra = {}) {
    const defaultContractMock = {
        userSubmittedAddressesCount: function(wallet, cb) {
            cb(null, params.count)
        },
        userAddress: function(wallet, index, cb) {
            cb(null, ['country', 'state', 'city', 'location', 'zip'])
        },
        userAddressConfirmed: function(wallet, index, cb) {
            cb(null, true)
        },
        unregisterAddress: function(country, state, city, location, zip, options, cb) {
            cb(null)
        }
    }

    const contractMock = { ...defaultContractMock, ...extra }

    return contractMock
}
