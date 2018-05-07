import { connect } from 'react-redux'
import INDIServerPage from '../components/INDIServerPage'
import Actions from '../actions'
import { getDeviceNames } from '../selectors/indi-properties';

const mapStateToProps = (state, ownProps) => ({
    devices: getDeviceNames(state),
    indiDeviceTab: state.navigation.indi.device in state.indiserver.deviceEntities ? state.navigation.indi.device : null,
    hasLocalServer: state.indiservice.server_found,
})

const mapDispatchToProps = dispatch => ({ navigateToDevice: device => dispatch(Actions.Navigation.toINDIDevice(device)) })

const INDIServerContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(INDIServerPage)

export default INDIServerContainer 

