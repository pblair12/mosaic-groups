import * as request from 'superagent';
import { push } from 'react-router-redux';
import { toastr } from 'react-redux-toastr';

export const REQUEST_GROUPS = 'REQUEST_GROUPS';
export const RECEIVE_GROUPS = 'RECEIVE_GROUPS';
export const ADD_GROUP = 'ADD_GROUP';
export const UPDATE_GROUP = 'UPDATE_GROUP';
export const JOIN_GROUP = 'JOIN_GROUP';
export const NEW_SEMESTER = 'NEW_SEMESTER';
export const DELETE_GROUP = 'DELETE_GROUP';

export const requestGroups = () => ({
    type: REQUEST_GROUPS
});

export const receiveGroups = response => ({
    type: RECEIVE_GROUPS,
    groups: response.body
});

const getGroups = () => dispatch => {
    dispatch(requestGroups());
    return request.get('/api/groups')
        .then(response => {
            return dispatch(receiveGroups(response));
        });
};

const shouldFetchGroups = (state) => {
    const groups = state.groups;
    if (groups.isFetching) {
        return false;
    }
    return true;
};

export const startNewSemester = (name) => (dispatch, getState) => {
    dispatch({
        type: NEW_SEMESTER,
        name
    });

    request.post('/api/groups/addSemester')
        .send({ 'semesterName': name })
        .then(response => {
            toastr.success('Success', `Started New Semester: "${name}"`);
        })
        .catch(err => {
            toastr.error('Error', `Could Not Start Semester "${name}"`);
        })
        // because semester changes affect the groups, we need to repull groups.
        .then(() => {
            dispatch(getGroups());
        });
};

export const fetchGroupsIfNeeded = () => (dispatch, getState) => {
    if (shouldFetchGroups(getState())) {
        return dispatch(getGroups());
    }
};

export const addGroup = (group) => (dispatch, getState) => {
    group.members = [];
    dispatch({
        type: ADD_GROUP,
        group
    });
    return request.post('/api/groups')
        .send(group)
        .then(response => {
            toastr.success('Success', `You have successfully added ${group.title}`);
            dispatch(push('/'));
        })
        .catch(err => {
            toastr.error('Error', `There was an error adding ${group.title}. Please send this error to the group coordinator:  ${err}`);
        });
};

export const deleteGroup = (group) => (dispatch, getState) => {
    dispatch({
        type: DELETE_GROUP,
        group
    });
    return request.delete(`/api/groups/${group._id}`)
        .then(response => {
            toastr.success('Success', `${group.title} has been deleted`);
        })
        .catch(err => {
            toastr.error('Error', `There was an error deleting ${group.title}, Please send this error to the group coordinator:  ${err}`);
        });
};

export const updateGroup = (group) => (dispatch, getState) => {
    dispatch({
        type: UPDATE_GROUP,
        group
    });
    return request.post(`/api/groups/${group._id}`)
        .send(group)
        .then(response => {
            toastr.success('Success', `You have successfully updated ${group.title}`);
            dispatch(push('/'));
        })
        .catch(err => {
            toastr.error('Error', `There was an error updating ${group.title}, Please send this error to the group coordinator:  ${err}`);
        });
};

export const joinGroup = ({ member, spouse }, groupId) => (dispatch, getState) => {
    dispatch({
        type: JOIN_GROUP
    });
    member.status = 'PENDING';
    let data = { newMember: member };
    if (spouse) {
        spouse.status = 'PENDING';
        data.newMemberSpouse = spouse;
    }

    return request.post(`/api/groups/${groupId}/add-member`)
        .send(data)
        .then(response => {
            toastr.success('Success', `You're request to join this group has been submitted. 
            You will recieve an email from the group leader confirming your membership.`);
            dispatch(push('/'));
        })
        .catch(err => {
            toastr.error('Error', `There was an error joining this group, Please send this error to the group coordinator:  ${err}`);
        });
};



