import React from 'react';
import { Routes } from '../routes';
import { Route } from "react-router-dom";


import { SequencesListSectionMenu } from '../Sequences/SequencesList';
import { SequenceSectionMenuContainer } from '../Sequences/SequenceContainer';
import { SequenceJobImagesContainer } from '../SequenceJobs/ImagesContainer';
import { ImageSectionMenuContainer } from '../Image/ImageContainer';
import { NavItem } from './NavbarMenu';
import { PlateSolvingSectionMenuContainer } from '../PlateSolving/PlateSolvingContainer';
import { CameraSectionMenu } from '../Camera/Camera';


export const NavbarMenuItems = ({disabled, onClick = () => true}) => (
    <React.Fragment>
        <NavItem icon='list' content='Sequences' to={Routes.SEQUENCES_PAGE} disabled={disabled} onClick={onClick} />
        <NavItem icon='computer' content='INDI Server' to={Routes.INDI_PAGE} disabled={disabled} onClick={onClick} />
        <NavItem icon='camera' content='Camera' to={Routes.CAMERA_PAGE} disabled={disabled} onClick={onClick}/>
        <NavItem icon='target' content='Plate Solving' to={Routes.PLATE_SOLVING_PAGE} disabled={disabled} onClick={onClick}/>
        <NavItem icon='settings' content='System & Settings' to={Routes.SETTINGS_PAGE} disabled={disabled} onClick={onClick} />
        <Route exact path={Routes.SEQUENCES_LIST} component={SequencesListSectionMenu} />
        <Route path={Routes.SEQUENCE_PAGE.route} exact={true} render={
            ({match}) => <SequenceSectionMenuContainer sequenceId={match.params.id} />
        } />
        <Route path={Routes.SEQUENCE_JOB_IMAGES} exact={true} render={
            ({match}) => <SequenceJobImagesContainer sequenceJob={match.params.itemId} />
        } />
        <Route exact path={Routes.CAMERA_PAGE} component={CameraSectionMenu} />
        <Route exact path={Routes.PLATE_SOLVING_PAGE} component={PlateSolvingSectionMenuContainer} />
        <Route path={Routes.IMAGE_PAGE} render={({match}) => <ImageSectionMenuContainer id={match.params.id} type={match.params.type} />} />
    </React.Fragment>
)


