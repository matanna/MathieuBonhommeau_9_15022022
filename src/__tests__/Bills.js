/**
 * @jest-environment jsdom
 */
import {fireEvent, screen, waitFor} from "@testing-library/dom"
import '@testing-library/jest-dom/extend-expect'
import userEvent from '@testing-library/user-event'
import BillsUI, {rows} from "../views/BillsUI.js"
import { bills, billsDateCorrupt } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import router from "../app/Router.js";
import Bills from "../containers/Bills.js"

describe("Given I am connected as an employee", () => {

  let billsObject

  afterEach(() => {
    document.body.innerHTML = ''
    billsObject = ''
  })

  describe("When I am on Bills Page", () => {
    
    it('Then the number of bills diplayed on the page is 4', () => {
      document.body.innerHTML = BillsUI({data: bills})
      const lineOfBills = screen.getByTestId('tbody').querySelectorAll('tr')
      expect(lineOfBills.length).toEqual(4)
    })

    it("Then bills dispayed on the page are those of connected user", () => {
      
    })

    it("Then bills should be ordered from earliest to latest", () => {
      // Get all date elements for check if their are in the good order
      document.body.innerHTML = BillsUI({data: bills})
      const dates = screen.getAllByTestId("date").map(a => a.innerHTML)
      const regex = /^([1-9]|[12][0-9]|3[01]) [JFMASNOD][a-zéû]{2}. [0-9]{2}$/i
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].filter(e => e !== null && e.match(regex)).sort(antiChrono)
      expect(dates.slice(0, datesSorted.length)).toEqual(datesSorted)
    })

    it('Then, Loading page should be rendered', () => {
      document.body.innerHTML = BillsUI({ loading: true })
      expect(screen.getAllByText('Loading...')).toBeTruthy()
    })

    it('Then, Error page should be rendered', () => {
      document.body.innerHTML = BillsUI({ error: true })
      expect(screen.getByTestId('error-message')).toBeTruthy()
    })

    it("Then the bill date is displayed in the good format", () => {
      document.body.innerHTML = BillsUI({data: bills})
      const date = screen.getAllByTestId("date").map(a => a.innerHTML)[0]
      expect(date).toEqual('4 Avr. 04')
    })

    describe('When a bill date is corrupted', () => {
      it("Then the bill date is displayed not formatted and a error message is dispatched", () => {
        document.body.innerHTML = ''
        document.body.innerHTML = BillsUI({data: billsDateCorrupt})
        
        const date = screen.getAllByTestId("date").map(a => a.innerHTML)[0]
        expect(date).toEqual('204-04')
        const date2 = screen.getAllByTestId("date").map(a => a.innerHTML)[1]
        expect(date2).toEqual('null')
      })

      it("Then an error message is send in console", () => {
        jest.spyOn(global.console, 'log')
        BillsUI({data: billsDateCorrupt})
        expect(console.log).toHaveBeenCalledTimes(2)
      })
    })

    describe('When i click on the new bill button', () => {
      it("Then i am redirected on the new bill page and i can see 'Envoyer une note de frais'", () => {
        document.body.innerHTML = BillsUI({data: bills})
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        const store = null
        billsObject = new Bills({document, onNavigate, store, localStorage: window.localStorage})
        const handleClickNewBill = jest.fn(billsObject.handleClickNewBill)
        const newBillBtn = screen.getByTestId('btn-new-bill')
        newBillBtn.addEventListener('click', handleClickNewBill)
        fireEvent.click(newBillBtn)
        expect(handleClickNewBill).toHaveBeenCalled()
        expect(screen.queryByText('Envoyer une note de frais')).not.toBeNull()
      })
    })

    describe('When i click on an eye icon', () => {
      it("Then a modal is open with the bill proof and i can see 'justificatif'", async () => {
        document.body.innerHTML = BillsUI({data: bills})
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        const store = null
        billsObject = new Bills({document, onNavigate, store, localStorage: window.localStorage})

        // Mock the bootstrap function modal
        $.fn.modal = jest.fn();

        const handleClickIconEye = jest.fn(billsObject.handleClickIconEye)
        const iconEye = screen.getAllByTestId('icon-eye')[0]
        iconEye.addEventListener('click', () => handleClickIconEye(iconEye)) 
        
        fireEvent.click(iconEye)
        expect(handleClickIconEye).toHaveBeenCalled()
        const modalBodyImg = screen.getByAltText('Bill')
        expect(modalBodyImg).toBeTruthy()
      })
    })
  })

})
