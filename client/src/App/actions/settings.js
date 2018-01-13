import * as request from 'superagent';

import { toastr } from 'react-redux-toastr';
import { apiPath } from '../utils/index.js';

export const REQUEST_SETTINGS = 'REQUEST_SETTINGS';
export const RECEIVE_SETTINGS = 'RECEIVE_SETTINGS';
export const UPDATE_SETTINGS = 'UPDATE_SETTINGS';

export const requestSettings = () => ({
    type: REQUEST_SETTINGS
});

export const receiveSettings = json => ({
    type: RECEIVE_SETTINGS,
    settings: json
});

const fetchSettings = () => dispatch => {
    dispatch(requestSettings());
    return request.get(apiPath + '/api/settings')
        .withCredentials()
        .then(response => dispatch(receiveSettings(response.body)));
};

const shouldFetchSettings = (state) => {
    const settings = state.settings;

    if (settings && (settings.hasSettings || settings.isFetching)) {
        return false;
    }
    return true;
};

export const fetchSettingsIfNeeded = () => (dispatch, getState) => {
    if (shouldFetchSettings(getState())) {
        return dispatch(fetchSettings());
    }
};

export const updateSettings = (key, value) => (dispatch, getState) => {
    let settings = Object.assign({}, getState().settings, { [key]: value });
    dispatch({
        type: UPDATE_SETTINGS,
        settings
    });

    return request.post(apiPath + '/api/settings')
        .withCredentials()
        .send(settings)
        .then(response => {
            toastr.success('Success', 'Your changes have been saved');
            dispatch(fetchSettings());
        })
        .catch(err => {
            toastr.error('Error', 'There was an error saving your changes');
        });
};