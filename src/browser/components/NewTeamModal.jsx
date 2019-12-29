// Copyright (c) 2015-2016 Yuya Ochiai
// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {Modal, Button, FormGroup, FormControl, ControlLabel, HelpBlock} from 'react-bootstrap';

import Utils from '../../utils/util';

export default class NewTeamModal extends React.Component {
  constructor() {
    super();

    this.wasShown = false;
    this.state = {
      teamName: '',
      teamUrl: '',
      saveStarted: false,
    };
  }

  initializeOnShow() {
    this.setState({
      teamName: this.props.team ? this.props.team.name : '',
      teamUrl: this.props.team ? this.props.team.url : '',
      teamIndex: this.props.team ? this.props.team.index : false,
      saveStarted: false,
    });
  }

  getTeamNameValidationError() {
    if (!this.state.saveStarted) {
      return null;
    }
    return this.state.teamName.length > 0 ? null : '请填写团队名称';
  }

  getTeamNameValidationState() {
    return this.getTeamNameValidationError() === null ? null : 'error';
  }

  handleTeamNameChange(e) {
    this.setState({
      teamName: e.target.value,
    });
  }

  getTeamUrlValidationError() {
    if (!this.state.saveStarted) {
      return null;
    }
    if (this.state.teamUrl.length === 0) {
      return '请填写服务器地址';
    }
    if (!(/^https?:\/\/.*/).test(this.state.teamUrl.trim())) {
      return '服务器地址。必须以 http:// 或者 https:// 开头.';
    }
    if (!Utils.isValidURL(this.state.teamUrl.trim())) {
      return '服务器地址格式有误';
    }
    return null;
  }

  getTeamUrlValidationState() {
    return this.getTeamUrlValidationError() === null ? null : 'error';
  }

  handleTeamUrlChange(e) {
    this.setState({
      teamUrl: e.target.value,
    });
  }

  getError() {
    const nameError = this.getTeamNameValidationError();
    const urlError = this.getTeamUrlValidationError();

    if (nameError && urlError) {
      return '请填写服务器名称和地址';
    } else if (nameError) {
      return nameError;
    } else if (urlError) {
      return urlError;
    }
    return null;
  }

  validateForm() {
    return this.getTeamNameValidationState() === null &&
           this.getTeamUrlValidationState() === null;
  }

  save() {
    this.setState({
      saveStarted: true,
    }, () => {
      if (this.validateForm()) {
        this.props.onSave({
          url: this.state.teamUrl,
          name: this.state.teamName,
          index: this.state.teamIndex,
        });
      }
    });
  }

  getSaveButtonLabel() {
    if (this.props.editMode) {
      return '保存';
    }
    return '添加';
  }

  getModalTitle() {
    if (this.props.editMode) {
      return '编辑服务器';
    }
    return '添加服务器';
  }

  render() {
    if (this.wasShown !== this.props.show && this.props.show) {
      this.initializeOnShow();
    }
    this.wasShown = this.props.show;

    return (
      <Modal
        bsClass='modal'
        className='NewTeamModal'
        show={this.props.show}
        id='newServerModal'
        onHide={this.props.onClose}
        onKeyDown={(e) => {
          switch (e.key) {
          case 'Enter':
            this.save();

            // The add button from behind this might still be focused
            e.preventDefault();
            e.stopPropagation();
            break;
          case 'Escape':
            this.props.onClose();
            break;
          }
        }}
      >
        <Modal.Header>
          <Modal.Title>{this.getModalTitle()}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <form>
            <FormGroup
              validationState={this.getTeamNameValidationState()}
            >
              <ControlLabel>{'服务器名称'}</ControlLabel>
              <FormControl
                id='teamNameInput'
                type='text'
                value={this.state.teamName}
                placeholder='服务器名称'
                onChange={this.handleTeamNameChange.bind(this)}
                onClick={(e) => {
                  e.stopPropagation();
                }}
              />
              <FormControl.Feedback/>
              <HelpBlock>{'服务器名称将会显示在菜单栏'}</HelpBlock>
            </FormGroup>
            <FormGroup
              className='NewTeamModal-noBottomSpace'
              validationState={this.getTeamUrlValidationState()}
            >
              <ControlLabel>{'服务器地址'}</ControlLabel>
              <FormControl
                id='teamUrlInput'
                type='text'
                value={this.state.teamUrl}
                placeholder='https://example.com'
                onChange={this.handleTeamUrlChange.bind(this)}
                onClick={(e) => {
                  e.stopPropagation();
                }}
              />
              <FormControl.Feedback/>
              <HelpBlock className='NewTeamModal-noBottomSpace'>{'服务器地址。必须以 http:// 或者 https:// 开头.'}</HelpBlock>
            </FormGroup>
          </form>
        </Modal.Body>

        <Modal.Footer>
          <div
            className='pull-left modal-error'
          >
            {this.getError()}
          </div>

          <Button
            id='cancelNewServerModal'
            onClick={this.props.onClose}
          >{'取消'}</Button>
          <Button
            id='saveNewServerModal'
            onClick={this.save.bind(this)}
            disabled={!this.validateForm()}
            bsStyle='primary'
          >{this.getSaveButtonLabel()}</Button>
        </Modal.Footer>

      </Modal>
    );
  }
}

NewTeamModal.propTypes = {
  onClose: PropTypes.func,
  onSave: PropTypes.func,
  team: PropTypes.object,
  editMode: PropTypes.bool,
  show: PropTypes.bool,
};
