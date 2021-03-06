
let appendSequence = (state, action) => {
    return { ...state, entities: {...state.entities, [action.sequence.id]: action.sequence}, ids: state.ids.concat(action.sequence.id)};
}

let addSequenceJob = (state, action) => {
    let sequenceId = action.sequence;
    let sequence = state.entities[sequenceId];
    sequence = { ...sequence, sequenceJobs: sequence.sequenceJobs.concat(action.sequenceJob.id) };
    return {...state, entities: { ...state.entities, [sequenceId]: sequence } }
}

let updateSequence = (state, sequence) => ({
    ...state,
    entities: {...state.entities, [sequence.id]: {...state.entities[sequence.id], ...sequence} }
})

let deleteSequenceJob = (state, action) => {
    let sequence = state.entities[action.sequenceJob.sequence];
    sequence = {...sequence, sequenceJobs: sequence.sequenceJobs.filter(id => id !== action.sequenceJob.id)}
    return { ...state, entities: {...state.entities, [sequence.id]: sequence} }
}


const sequences = (state = { entities: {}, ids: [] }, action) => {
    switch(action.type) {
        case 'SEQUENCE_CREATED':
            return appendSequence(state, action);
        case 'SEQUENCE_JOB_CREATED':
            return addSequenceJob(state, action);
        case 'RECEIVE_SEQUENCES':
            return {...state, ids: action.ids, entities: action.sequences ? action.sequences : {} };
        case 'SEQUENCE_JOB_DELETED':
            return deleteSequenceJob(state, action);
        case 'RECEIVED_START_SEQUENCE_REPLY':
            return updateSequence(state, action.sequence);
        case 'SEQUENCE_UPDATED':
            return updateSequence(state, action.data.entities.sequences[action.data.result]);
        case 'SEQUENCE_TOGGLE_SHOW_LAST_IMAGE':
            return {...state, showLastImage: action.showLastImage };
        default:
            return state;
    }
}

export default sequences
