const groupDisabled = (group, settings) => {
    return group.disabled || settings.disableGroups;
};

const groupIsFull = (group) => {
    let currentMemberCount = 0;
    if (group.members) {
        currentMemberCount = group.members.length;
    }
    return currentMemberCount >= group.memberLimit;
};

const userIsLeaderOfGroup = (group, identity) => {
    // filter leaders to see if the logged in user is a leader of the group
    return group.leaders
        .filter(leader => identity._id === leader._id)
        .length > 0;
};

const userCanEditGroup = (group, identity) => {
    let canEditGroup = false;
    if (!identity.username) {
        canEditGroup = false;
    } else if (identity.roles && identity.roles.includes('admin')) {
        canEditGroup = true;
    } else if (userIsLeaderOfGroup(group, identity)) {
        canEditGroup = true;
    }
    return canEditGroup;
};

const apiPath = process.env.NODE_ENV === 'production' ? 'https://api.mosaicgroups.org' : 'https://localhost:3031';

export { groupDisabled, groupIsFull, userIsLeaderOfGroup, userCanEditGroup, apiPath };