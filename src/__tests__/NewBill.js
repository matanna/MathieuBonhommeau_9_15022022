/**
 * @jest-environment jsdom
 */
import { fireEvent, screen, waitFor } from "@testing-library/dom"
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import {localStorageMock} from "../__mocks__/localStorage.js"
import { ROUTES, ROUTES_PATH} from "../constants/routes.js"
import mockStore from "../__mocks__/store"
import { bills } from "../fixtures/bills"
import { readyException } from "jquery"
import router from "../app/Router.js"
import { download } from "express/lib/response"

jest.spyOn(global.console, 'error')
jest.mock("../app/Store", () => mockStore)

describe("Given I am connected as an employee", () => {

  beforeEach(() => {
    document.body.innerHTML = ''
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("When I am on NewBill Page", () => {

    it("Then mail icon in vertical layout should be highlighted", () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
      const mailIcon = screen.getByTestId('icon-mail')
      expect(mailIcon).toHaveClass('active-icon')
    })

    it("Then the good title is dispalyed", () => {
      document.body.innerHTML = NewBillUI()
      expect(screen.getByText("Envoyer une note de frais")).toBeTruthy()
    })

    it("Then all fields are displayed", () => {
      document.body.innerHTML = NewBillUI()
      expect(screen.getByTestId("expense-type")).toBeTruthy()
      expect(screen.getByTestId("expense-name")).toBeTruthy()
      expect(screen.getByTestId("datepicker")).toBeTruthy()
      expect(screen.getByTestId("amount")).toBeTruthy()
      expect(screen.getByTestId("vat")).toBeTruthy()
      expect(screen.getByTestId("pct")).toBeTruthy()
      expect(screen.getByTestId("commentary")).toBeTruthy()
      expect(screen.getByTestId("file")).toBeTruthy()
      expect(screen.getByRole("button").textContent).toBe("Envoyer")
    })

    describe("When i fill all form fields with expected datas", () => {
      it("Then fields values matched than what i have entered", () => {
        document.body.innerHTML = NewBillUI()

        // Fill and test if the value of each fields is OK
        const type = screen.getByTestId("expense-type")
        fireEvent.change(type, {target: {value: "Transports"}})
        expect(type.value).toBe(("Transports"))
        const name = screen.getByTestId("expense-name")
        fireEvent.change(name, {target: {value: "test"}})
        expect(name.value).toBe(("test"))
        const date = screen.getByTestId("datepicker")
        fireEvent.change(date, {target: {value: '2022-03-02'}})
        expect(date.value).toBe(('2022-03-02'))
        const amount = screen.getByTestId("amount")
        fireEvent.change(amount, {target: {value: "500"}})
        expect(amount.value).toBe(("500"))
        const vat = screen.getByTestId("vat")
        fireEvent.change(vat, {target: {value: "20"}})
        expect(vat.value).toBe(('20'))
        const pct = screen.getByTestId("pct")
        fireEvent.change(pct, {target: {value: "20"}})
        expect(pct.value).toBe(("20"))
        const commentary = screen.getByTestId("commentary")
        fireEvent.change(commentary, {target: {value: "Un commentaire de test"}})
        expect(commentary.value).toBe(("Un commentaire de test"))
        const file = screen.getByTestId("file")
        const fileGoodData = {
          name: "fichier-test.jpg",
          type: "image/jpeg"
        }
        const fileTest = new File ([""], fileGoodData.name, { type: fileGoodData.type })
        fireEvent.change(file, {target: {files: [fileTest]} })
        expect(file.files[0].name).toBe(("fichier-test.jpg"))
        expect(file.files[0].type).toBe(("image/jpeg"))
      })
    })

    describe("When i submit the form without fill all fields", () => {
      it("Then the newBill page is already render, i'm not redirect", async () => {
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({type: 'Employee', email: 'a@a'}))
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.append(root)
        router()
        window.onNavigate(ROUTES_PATH.NewBill)

        // The store is mocked by mockStore for replace calls API
        const newBill = new NewBill({document, onNavigate, store: mockStore, window: window.localStorage})

        // No fill fields
        const type = screen.getByTestId("expense-type")
        expect(type.value).toBe(("Transports"))
        const name = screen.getByTestId("expense-name")
        fireEvent.change(name, {target: {value: ""}})
        expect(name.value).toBe((""))
        const date = screen.getByTestId("datepicker")
        fireEvent.change(date, {target: {value: ''}})
        expect(date.value).toBe((''))
        const amount = screen.getByTestId("amount")
        fireEvent.change(amount, {target: {value: ""}})
        expect(amount.value).toBe((""))
        const vat = screen.getByTestId("vat")
        fireEvent.change(vat, {target: {value: ""}})
        expect(vat.value).toBe((''))
        const pct = screen.getByTestId("pct")
        fireEvent.change(pct, {target: {value: ""}})
        expect(pct.value).toBe((""))
        const commentary = screen.getByTestId("commentary")
        fireEvent.change(commentary, {target: {value: ""}})
        expect(commentary.value).toBe((""))
        const file = screen.getByTestId("file")
        fireEvent.change(file, {target: {files: ""} })
        expect(file.value).toBe((""))

        const handleSubmit = jest.fn(newBill.handleSubmit)
        const formNewBill = screen.getByTestId('form-new-bill')
        formNewBill.addEventListener('submit', handleSubmit)
        fireEvent.submit(formNewBill)

        await waitFor(() => expect(screen.getByText('Envoyer une note de frais')).toBeTruthy())

      })
    })

    describe("When i choose a file with a good extention in the input file", () => { 
      it("Then the is saved in the browser and any error is throw", () => {
        document.body.innerHTML = NewBillUI()
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))

        const fileGoodData = {
          name: "fichier-test.jpg",
          type: "image/jpeg"
        }
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };
        const store = jest.fn()
        const newBill = new NewBill({document, onNavigate, store, window: window.localStorage})

        const handleChangeFile = jest.fn(newBill.handleChangeFile)
        let inputFile = screen.getByTestId("file")
        inputFile.addEventListener('change', handleChangeFile)

        const fileTest = new File ([""], fileGoodData.name, { type: fileGoodData.type })
        fireEvent.change(inputFile, {target: {files: [fileTest]} })

        expect(handleChangeFile).toHaveBeenCalled()
        expect(inputFile.files[0].name).toBe(fileGoodData.name)
        expect(inputFile.files[0].type).toBe(fileGoodData.type)
        expect(console.error).not.toHaveBeenCalled()
      })
    })

    describe("When i choose a file with a bad extention in the input file", () => { 
      it("Then the input file send an error", () => {
        document.body.innerHTML = NewBillUI()
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
        
        const fileBadData = {
          name: "fichier-test.txt",
          type: "text/txt"
        }
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };
        const store = jest.fn()
        const newBill = new NewBill({document, onNavigate, store, window: window.localStorage})

        const handleChangeFile = jest.fn(newBill.handleChangeFile)
        let inputFile = screen.getByTestId("file")
        inputFile.addEventListener('change', handleChangeFile)

        const fileTest = new File ([""], fileBadData.name, { type: fileBadData.type })
        fireEvent.change(inputFile, {target: {files: [fileTest]} })

        expect(handleChangeFile).toHaveBeenCalled()
        expect(console.error).toHaveBeenCalled()
      })
    })
  })
})

// Intergration test - POST 
describe("Given i am on the new bill page and want to send a new bill", () => {

  const create = jest.spyOn(mockStore.bills(), 'create')
  const update = jest.spyOn(mockStore.bills(), 'update')

  beforeEach(() => {
    document.body.innerHTML = ''
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("When i submit the new bill with expected datas", () => {
    it("Then i am redirected on the bills page and i can see all my bills", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({type: 'Employee', email: 'a@a'}))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
     
      // The store is mocked by mockStore for replace calls API
      const newBill = new NewBill({document, onNavigate, store: mockStore, window: window.localStorage})
  
      // Fill and test if the value of each fields is OK
      const type = screen.getByTestId("expense-type")
      fireEvent.change(type, {target: {value: "Transports"}})
      const name = screen.getByTestId("expense-name")
      fireEvent.change(name, {target: {value: "test"}})
      const date = screen.getByTestId("datepicker")
      fireEvent.change(date, {target: {value: '2022-03-02'}})
      const amount = screen.getByTestId("amount")
      fireEvent.change(amount, {target: {value: "500"}})
      const vat = screen.getByTestId("vat")
      fireEvent.change(vat, {target: {value: "20"}})
      const pct = screen.getByTestId("pct")
      fireEvent.change(pct, {target: {value: "20"}})
      const commentary = screen.getByTestId("commentary")
      fireEvent.change(commentary, {target: {value: "Un commentaire de test"}})

      // Fill the input file
      const file = screen.getByTestId("file")
      const fileGoodData = {
        name: "fichier-test.jpg",
        type: "image/jpeg"
      }
      const fileTest = new File ([""], fileGoodData.name, { type: fileGoodData.type })
      fireEvent.change(file, {target: {files: [fileTest]} })
      const formData = new FormData()
      formData.append('file', file)
      formData.append('email', 'a@a')

      const handleSubmit = jest.fn(newBill.handleSubmit)
      const formNewBill = screen.getByTestId('form-new-bill')
      formNewBill.addEventListener('submit', handleSubmit)
      fireEvent.submit(formNewBill)
      
      // Test if the callback function is called when submit and if excepted data are send with
      expect(handleSubmit).toHaveBeenCalled

      // Test if create function is called and if excepted data are send with
      expect(create).toHaveBeenCalled()
      expect(create).toBeCalledWith(
        expect.objectContaining({
          data: formData,
          headers: {
            noContentType: true
          }
        })
      )
      // Test if received datas is Ok
      expect(create()).resolves.toStrictEqual({ fileUrl: 'https://localhost:3456/images/test.jpg', key: '1234' })

      // Test if update function is called and if excepted data are send with
      await waitFor(() => expect(update).toHaveBeenCalled())
      await waitFor(() => expect(update).toBeCalledWith(
        expect.objectContaining({
            data: JSON.stringify({
              type: type.value,
              name:  name.value,
              amount: parseInt(amount.value),
              date:  date.value,
              vat: vat.value,
              pct: parseInt(pct.value),
              commentary: commentary.value,
              fileUrl: 'https://localhost:3456/images/test.jpg',
              fileName: "",
              status: 'pending'
            }), 
            selector: '1234'
        })
      ))
      // Test if received datas is Ok
      expect(update()).resolves.toStrictEqual({
        "id": "47qAXb6fIm2zOKkLzMro",
        "vat": "80",
        "fileUrl": "https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
        "status": "pending",
        "type": "Hôtel et logement",
        "commentary": "séminaire billed",
        "name": "encore",
        "fileName": "preview-facture-free-201801-pdf-1.jpg",
        "date": "2004-04-04",
        "amount": 400,
        "commentAdmin": "ok",
        "email": "a@a",
        "pct": 20
      })

      // Test if the redirection on bills page after submit is ok
      await waitFor(() => {
        expect(screen.getByText('Mes notes de frais')).toBeTruthy()
        expect(screen.getByTestId("tbody").querySelectorAll('tr').length).toEqual(4)
        expect(document.querySelector('tr[data-id="47qAXb6fIm2zOKkLzMro"]')).toBeTruthy()
      })
    })
  })

  describe("When a 500 error occurs by API and when this error occurs since create method", () => {
    it("Then i'm not redirect after submit and an error is dispatched in console", async () => {
      create.mockClear()
      create.mockImplementation(() => {
        return Promise.reject(new Error("Erreur 500"))
      })
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({type: 'Employee', email: 'a@a'}))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)

      // The store is mocked by mockStore for replace calls API
      const newBill = new NewBill({document, onNavigate, store: mockStore, window: window.localStorage})
    
      const handleSubmit = jest.fn(newBill.handleSubmit)
      const formNewBill = screen.getByTestId('form-new-bill')
      formNewBill.addEventListener('submit', handleSubmit)
      fireEvent.submit(formNewBill)

      await waitFor(() => expect(create()).rejects.toEqual(new Error("Erreur 500")))
      await waitFor(() => expect(console.error).toHaveBeenCalled())
      await waitFor(() => expect(screen.getByText("Envoyer une note de frais")).toBeTruthy())

    })
  })

  describe("When a 404 error occurs by API and when this error occurs since update method", () => {
    it("Then the i'm not redirect after submit and an error is dispatched in console", async () => {
      update.mockImplementation(() => {
        return Promise.reject(new Error("Erreur 404"))
      })
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({type: 'Employee', email: 'a@a'}))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)

      // The store is mocked by mockStore for replace calls API
      const newBill = new NewBill({document, onNavigate, store: mockStore, window: window.localStorage})
    
      const handleSubmit = jest.fn(newBill.handleSubmit)
      const formNewBill = screen.getByTestId('form-new-bill')
      formNewBill.addEventListener('submit', handleSubmit)
      fireEvent.submit(formNewBill)

      await waitFor(() => expect(update()).rejects.toEqual(new Error("Erreur 404")))
      await waitFor(() => expect(console.error).toHaveBeenCalled())
      await waitFor(() => expect(screen.getByText("Envoyer une note de frais")).toBeTruthy())
    })
  })
})



  
