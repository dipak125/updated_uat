import { createStore,combineReducers, applyMiddleware, compose } from 'redux'
import {composeWithDevTools} from 'redux-devtools-extension'
import thunk from 'redux-thunk'

import Auth from "./reducers/auth";
import Loader from "./reducers/loader";

const composeEnhancers = compose;

const rootReducer = combineReducers(
    {
        auth: Auth,
        loader: Loader
    }
)

const store = createStore(rootReducer, composeWithDevTools(applyMiddleware(thunk)))

export default store