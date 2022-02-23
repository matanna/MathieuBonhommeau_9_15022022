import store from "./Store.js"
import Login, { PREVIOUS_LOCATION } from "../containers/Login.js"
import Bills  from "../containers/Bills.js"
import NewBill from "../containers/NewBill.js"
import Dashboard from "../containers/Dashboard.js"

import BillsUI from "../views/BillsUI.js"
import DashboardUI from "../views/DashboardUI.js"

import { ROUTES, ROUTES_PATH } from "../constants/routes.js"

/**
 * Enter point of the application
 */
export default () => {
  //Get attach section in index.html
  const rootDiv = document.getElementById('root')
  
  // Call the route in term of current pathname and load the good template
  rootDiv.innerHTML = ROUTES({ pathname: window.location.pathname })

  /**
   * Function which manage navigation on application and dispatches each routes
   * @param {string} pathname 
   */
  window.onNavigate = (pathname) => {
    // Save the current state of document in history (use forward and backward arrow is impossible)
    window.history.pushState(
      {},
      pathname,
      window.location.origin + pathname
    )
    
    // For the Login route (/)
    if (pathname === ROUTES_PATH['Login']) {
      // Import the good temlplate
      rootDiv.innerHTML = ROUTES({ pathname })
      document.body.style.backgroundColor="#0E5AE5"
      // Instantiate a login object for manage connection of users
      new Login({ document, localStorage, onNavigate, PREVIOUS_LOCATION, store })

    // For the bills route (#employee/bills)
    } else if (pathname === ROUTES_PATH['Bills']) {
      // Import the good template 
      rootDiv.innerHTML = ROUTES({ pathname, loading: true })

      // Get icons in the left sidebar for adapt style in terms of what is displayed
      const divIcon1 = document.getElementById('layout-icon1')
      const divIcon2 = document.getElementById('layout-icon2')
      divIcon1.classList.add('active-icon')
      divIcon2.classList.remove('active-icon')

      // Instantiate a bill object for manage bills operations
      const bills = new Bills({ document, onNavigate, store, localStorage  })
      // Retrieve bills from the API
      bills.getBills().then(data => {
        // Inject bills in the page
        rootDiv.innerHTML = BillsUI({ data })

        // Get icons in the left sidebar for adapt style in terms of what is displayed
        const divIcon1 = document.getElementById('layout-icon1')
        const divIcon2 = document.getElementById('layout-icon2')
        divIcon1.classList.add('active-icon')
        divIcon2.classList.remove('active-icon')

        // Create bills with the bill object
        new Bills({ document, onNavigate, store, localStorage })

      // If getBills gives an error  
      }).catch(error => {
        rootDiv.innerHTML = ROUTES({ pathname, error })
      })

    // For the bills route (#employee/bill/new)
    } else if (pathname === ROUTES_PATH['NewBill']) {
      // Import the good template 
      rootDiv.innerHTML = ROUTES({ pathname, loading: true })
      // Instantiate a new object NewBill for create a new bill
      new NewBill({ document, onNavigate, store, localStorage })

      // Get icons in the left sidebar for adapt style in terms of what is displayed
      const divIcon1 = document.getElementById('layout-icon1')
      const divIcon2 = document.getElementById('layout-icon2')
      divIcon1.classList.remove('active-icon')
      divIcon2.classList.add('active-icon')

    // For the dashboard route (#admin/dashboard)
    } else if (pathname === ROUTES_PATH['Dashboard']) {
      // Import the good template 
      rootDiv.innerHTML = ROUTES({ pathname, loading: true })
      // Instantiate a new Dashboard object for manage dashboard operations on bills
      const bills = new Dashboard({ document, onNavigate, store, bills: [], localStorage })
      // Retrieve all bills from the API
      bills.getBillsAllUsers().then(bills => {
          // Inject bills in the dashboard page
          rootDiv.innerHTML = DashboardUI({data: {bills}})
          // Create bills with the bill object
          new Dashboard({document, onNavigate, store, bills, localStorage})

        // if getBillsAllUsers give an error
        }).catch(error => {
        rootDiv.innerHTML = ROUTES({ pathname, error })
      })
    }
  }

  /**
   * Event dispatched when the user click on the browser backward button
   * @param {Event} e 
   */
  window.onpopstate = (e) => {
    // Get the current user in localStorage
    const user = JSON.parse(localStorage.getItem('user'))
    // If the user is on login page and he is not logged
    if (window.location.pathname === "/" && !user) {
      document.body.style.backgroundColor="#0E5AE5"
      // import login template
      rootDiv.innerHTML = ROUTES({ pathname: window.location.pathname })
    }
    // If user exist in localStorage
    else if (user) {
      // Call onNavigate for go back to the last route - PREVIOUS_LOCATION is given by Login.js
      onNavigate(PREVIOUS_LOCATION)
    }
  }

  /**
   * When the page is load
   */
  // If pathname = / and hash = "" then we are on the login route
  if (window.location.pathname === "/" && window.location.hash === "") {
    new Login({ document, localStorage, onNavigate, PREVIOUS_LOCATION, store })
    document.body.style.backgroundColor="#0E5AE5"
  
  // If hash !== "" - thn the user is logged
  } else if (window.location.hash !== "") {

    // the user is on the Bills route
    if (window.location.hash === ROUTES_PATH['Bills']) {
      // import the good template
      rootDiv.innerHTML = ROUTES({ pathname: window.location.hash, loading: true })

      // Get icons in the left sidebar for adapt style in terms of what is displayed
      const divIcon1 = document.getElementById('layout-icon1')
      const divIcon2 = document.getElementById('layout-icon2')
      divIcon1.classList.add('active-icon')
      divIcon2.classList.remove('active-icon')

      // Create bills with the bill object
      const bills = new Bills({ document, onNavigate, store, localStorage  })
      
      // Retrieve bills from API
      bills.getBills().then(data => {
        // Inject bills in document 
        rootDiv.innerHTML = BillsUI({ data })

        const divIcon1 = document.getElementById('layout-icon1')
        const divIcon2 = document.getElementById('layout-icon2')
        divIcon1.classList.add('active-icon')
        divIcon2.classList.remove('active-icon')

        // Create bills with the bill object
        new Bills({ document, onNavigate, store, localStorage })
      
      // If getBills give an error
      }).catch(error => {
        rootDiv.innerHTML = ROUTES({ pathname: window.location.hash, error })
      })

    // the user is on the NewBill route
    } else if (window.location.hash === ROUTES_PATH['NewBill']) {
      // import the good template
      rootDiv.innerHTML = ROUTES({ pathname: window.location.hash, loading: true })

      // Insantiate a new object NewBill for manage new bill operations
      new NewBill({ document, onNavigate, store, localStorage })

      // Get icons in the left sidebar for adapt style in terms of what is displayed
      const divIcon1 = document.getElementById('layout-icon1')
      const divIcon2 = document.getElementById('layout-icon2')
      divIcon1.classList.remove('active-icon')
      divIcon2.classList.add('active-icon')

    // the user is on the Dashboard route
    } else if (window.location.hash === ROUTES_PATH['Dashboard']) {
      // import the good template
      rootDiv.innerHTML = ROUTES({ pathname: window.location.hash, loading: true })

      // Insantiate a new object Dashboard for manage new dashboard operations
      const bills = new Dashboard({ document, onNavigate, store, bills: [], localStorage })

      // Get all bills from API
      bills.getBillsAllUsers().then(bills => {
        // Inject bills in the document
        rootDiv.innerHTML = DashboardUI({ data: { bills } })
        // Creta bills with the Dashboard object
        new Dashboard({ document, onNavigate, store, bills, localStorage })

      // If getBillsAllUsers give an error
      }).catch(error => {
        rootDiv.innerHTML = ROUTES({ pathname: window.location.hash, error })
      })
    }
  }

  return null
}

