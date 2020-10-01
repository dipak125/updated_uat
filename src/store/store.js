import { createStore,combineReducers, applyMiddleware, compose } from 'redux'
import {composeWithDevTools} from 'redux-devtools-extension'
import thunk from 'redux-thunk'

import Auth from "./reducers/auth";
import Loader from "./reducers/loader";
import ProcessData from "./reducers/data";

// const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const composeEnhancers = compose;

const rootReducer = combineReducers(
    {
        auth: Auth,
        loader: Loader,
        processData: ProcessData
    }
)

const store = createStore(rootReducer, composeWithDevTools(applyMiddleware(thunk)))

export default store