import { solveFieldAPI } from "../middleware/api";
import Actions from '../actions';
import { solveFromCameraSelector } from './selectors';


export const PlateSolving = {
    Options: {
        camera: 'camera',
        telescope: 'telescope',
        astrometryDriver: 'astrometryDriver',
        fov: 'fov',
        fovSource: 'fovSource',
        syncTelescope: 'syncTelescope',
        downsample: 'downsample',
    },
    setOption: (option, value) => ({ type: 'PLATESOLVING_SET_OPTION', option, value }),

    fieldSolved: payload => ({ type: 'PLATESOLVING_SOLVED', payload }),
    solvingFailed: payload => ({ type: 'PLATESOLVING_FAILED', payload }),

    solveField: ({astrometryDriver, ...options}) => dispatch => {
        dispatch({ type: 'FETCH_PLATESOLVING_SOLVE_FIELD' });
        const onSuccess = result => {
            dispatch(Actions.Notifications.add('Platesolving successful', '', 'success', 5000));
            dispatch(Actions.PlateSolving.fieldSolved(result));
        };
        const onError = (error, isJSON) => {
            if(!isJSON) {
                if(error.status === 413) {
                    const error_message = 'Request body too large. You probably need to configure your web server (nginx, apache) to accept large files upload.'
                    dispatch(Actions.Notifications.add('Platesolving failed', error_message, 'warning', 5000));
                    dispatch(Actions.PlateSolving.solvingFailed(error_message));
                    return true;
                } else {
                    return false;
                }
            }
            error.json().then( ({error_message}) => {
                dispatch(Actions.Notifications.add('Platesolving failed', error_message, 'warning', 5000));
                dispatch(Actions.PlateSolving.solvingFailed(error_message));
            });
            return true;
        }

        solveFieldAPI(dispatch, onSuccess, onError, astrometryDriver, options);
    },

    solveCameraImage: filePath => (dispatch, getState) => {
        const { options } = solveFromCameraSelector(getState());
        if(!options.camera || ! options.astrometryDriver || ! options.telescope)
            return;
        dispatch({ type: 'PLATESOLVING_SOLVING_CAMERAFILE'});
        dispatch(Actions.PlateSolving.solveField({ filePath, ...options }));
    }
};
