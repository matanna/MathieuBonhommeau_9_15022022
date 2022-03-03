/**
 * @jest-environment jsdom
 */
import {fireEvent, getByTestId, getByText, screen, waitFor} from "@testing-library/dom"
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import BillsUI from "../views/BillsUI.js"
import { ROUTES, ROUTES_PATH} from "../constants/routes.js"
import {localStorageMock} from "../__mocks__/localStorage.js"
import Bills from "../containers/Bills.js"
import { formatStatus } from '../app/format.js'
import mockStore from '../__mocks__/store.js'
import { bills, billsDateCorrupt } from "../fixtures/bills.js"
import router from "../app/Router.js"


jest.mock("../app/Store", () => mockStore)

describe("Given I am connected as an employee", () => {

  describe("When I am on Bills Page", () => {
    
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      const windowIcon = screen.getByTestId('icon-window')
      expect(windowIcon).toHaveClass('active-icon')
    })

    it('Then the number of bills diplayed on the page is 4', () => {
      document.body.innerHTML = BillsUI({data: bills})
      const lineOfBills = screen.getByTestId('tbody').querySelectorAll('tr')
      expect(lineOfBills.length).toEqual(4)
    })

    it("Then the page is empty if no bills are stored", () => {
      document.body.innerHTML = BillsUI({})
      const lineOfBills = screen.getByTestId('tbody').querySelectorAll('tr')
      expect(lineOfBills.length).toEqual(0)
    })

    it("Then the status is displayed in the good format", () => {
      document.body.innerHTML = BillsUI({data: bills})
      const status = screen.getAllByTestId('status')
      expect(status[0].innerHTML).toEqual('En attente')
      expect(status[1].innerHTML).toEqual('Accepté')
      expect(status[2].innerHTML).toEqual('Refusé')

      expect(formatStatus("pending")).toEqual("En attente")
      expect(formatStatus("refused")).toEqual("Refusé")
      expect(formatStatus("accepted")).toEqual("Accepté")

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

    it("Then the bill date is displayed in the good format", () => {
      document.body.innerHTML = BillsUI({data: bills})
      const date = screen.getAllByTestId("date").map(a => a.innerHTML)[0]
      expect(date).toEqual('4 Avr. 04')
    })

    describe('But the page is in Loading', () => {
      it('Then, Loading page should be rendered', () => {
        document.body.innerHTML = BillsUI({ loading: true })
        expect(screen.getAllByText('Loading...')).toBeTruthy()
      })
    })

    describe('But the occured an error', () => {
      it('Then, Error page should be rendered', () => {
        document.body.innerHTML = BillsUI({ error: true })
        expect(screen.getByTestId('error-message')).toBeTruthy()
      })
    })

    describe('When a bill date is corrupted', () => {
      it("Then the bill date is displayed not formated", () => {
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
        const billsObject = new Bills({document, onNavigate, store, localStorage: window.localStorage})
        const handleClickNewBill = jest.fn(billsObject.handleClickNewBill)
        const newBillBtn = screen.getByTestId('btn-new-bill')
        newBillBtn.addEventListener('click', handleClickNewBill)
        fireEvent.click(newBillBtn)
        expect(handleClickNewBill).toHaveBeenCalled()
        expect(screen.queryByText('Envoyer une note de frais')).not.toBeNull()
      })
    })

    describe('When i click on an eye icon', () => {
      it("Then a modal is open with the bill proof", async () => {
        document.body.innerHTML = BillsUI({data: bills})
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        const store = null
        const billsObject = new Bills({document, onNavigate, store, localStorage: window.localStorage})

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

//Integration tests GET
describe("Given I am a user connected as an employee", () => {
  describe("When i'm navigate on bills page", () => {

    beforeEach(() => {
      document.body.innerHTML = ''
    })

    afterEach(() => {
      jest.clearAllMocks()
    })

    it("Then bills are fetched from the API and displayed on the page", async () => {
      const listMock = jest.spyOn(mockStore.bills(), 'list')

      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH['Bills'])
      
      expect(listMock).toHaveBeenCalled()
      expect(listMock()).resolves.toStrictEqual(bills)

      await waitFor(() => expect(screen.getByText("Mes notes de frais")).toBeTruthy())
      await waitFor(() => expect(screen.getByTestId('tbody').length).toEqual(listMock().length))
      await waitFor(() => expect(document.querySelector('tr[data-id="47qAXb6fIm2zOKkLzMro"]').dataset.id).toBe(bills[0].id))
     
    })

    describe("When a 404 error is send by the API", () => {
      it("Then an error message is displayed on the page", async () => {
        expect.assertions(3);
        const listMock = jest.spyOn(mockStore.bills(), 'list').mockImplementation(() => {
          return Promise.reject(new Error("Erreur 404"))
        })

        localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.append(root)
        router()
        window.onNavigate(ROUTES_PATH['Bills'])

        expect(listMock).toHaveBeenCalled()
        expect(listMock()).rejects.toEqual(new Error("Erreur 404"))

        await waitFor(() => expect(screen.getByText(/Erreur 404/)).toBeTruthy())

      })
    })

    describe("When a 500 error is send by the API", () => {
      it("Then an error message is displayed on the page", async () => {
        expect.assertions(3);
        const listMock = jest.spyOn(mockStore.bills(), 'list').mockImplementation(() => {
          return Promise.reject(new Error("Erreur 500"))
        })

        localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.append(root)
        router()
        window.onNavigate(ROUTES_PATH['Bills'])

        expect(listMock).toHaveBeenCalled()
        expect(listMock()).rejects.toEqual(new Error("Erreur 500"))

        await waitFor(() => expect(screen.getByText(/Erreur 500/)).toBeTruthy())

      })
    })

  })
})
