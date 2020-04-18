/*
 *     Webcodesk
 *     Copyright (C) 2019  Oleksandr (Alex) Pustovalov
 *
 *     This program is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU General Public License as published by
 *     the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     This program is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU General Public License for more details.
 *
 *     You should have received a copy of the GNU General Public License
 *     along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import InputAdornment from '@material-ui/core/InputAdornment';
import ResourceIcon from '../commons/ResourceIcon';
import constants from '../../../commons/constants';
import { createState } from '../../core/pageComposer/pageComposerState';
import { validateFileNameAndDirectoryName } from '../commons/utils';

class NewTemplateDialog extends React.Component {
  static propTypes = {
    isOpen: PropTypes.bool,
    dirPath: PropTypes.string,
    templateModel: PropTypes.object,
    isNewInstance: PropTypes.bool,
    onClose: PropTypes.func,
    onSubmit: PropTypes.func,
  };

  static defaultProps = {
    isOpen: false,
    dirPath: '',
    templateModel: null,
    isNewInstance: false,
    onClose: () => {
      console.info('NewTemplateDialog.onClose is not set');
    },
    onSubmit: (options) => {
      console.info('NewTemplateDialog.onSubmit is not set: ', options);
    },
  };

  constructor (props) {
    super(props);
    this.state = {
      instanceNameText: '',
      instanceNameError: false,
      templateNameText: '',
      templateNameError: false,
      directoryNameText: this.props.dirPath,
      directoryNameError: false,
    };
  }

  shouldComponentUpdate (nextProps, nextState, nextContext) {
    const { isOpen, dirPath, templateModel, isNewInstance } = this.props;
    const {
      templateNameText,
      templateNameError,
      directoryNameText,
      directoryNameError,
      instanceNameText,
      instanceNameError
    } = this.state;
    return isOpen !== nextProps.isOpen
      || dirPath !== nextProps.dirPath
      || templateModel !== nextProps.templateModel
      || isNewInstance !== nextProps.isNewInstance
      || templateNameText !== nextState.templateNameText
      || templateNameError !== nextState.templateNameError
      || directoryNameText !== nextState.directoryNameText
      || directoryNameError !== nextState.directoryNameError
      || instanceNameText !== nextState.instanceNameText
      || instanceNameError !== nextState.instanceNameError;
  }

  componentDidUpdate (prevProps, prevState, snapshot) {
    const { dirPath, isOpen } = this.props;
    if (dirPath !== prevProps.dirPath || isOpen !== prevProps.isOpen) {
      this.setState({
        directoryNameText: dirPath,
      });
    }
  }

  handleClose = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    this.props.onClose(false);
  };

  handleSubmit = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    const { templateNameText, directoryNameText, instanceNameText } = this.state;
    const { templateNameError, directoryNameError, instanceNameError } = this.validateTexts({
      directoryNameText,
      templateNameText,
      instanceNameText
    });
    if (!templateNameError && !directoryNameError && !instanceNameError) {
      const { onSubmit, templateModel, isNewInstance } = this.props;
      let validTemplateModel = templateModel;
      let componentInstancesState;
      if (isNewInstance && validTemplateModel.props) {
        validTemplateModel = {...validTemplateModel};
        validTemplateModel.props.componentInstance = instanceNameText;
        componentInstancesState = createState(validTemplateModel);
      }
      onSubmit({
        templateName: templateNameText,
        directoryName: directoryNameText,
        templateModel: validTemplateModel,
        componentInstancesState,
      });
    } else {
      this.setState({
        instanceNameError,
        templateNameError,
        directoryNameError
      });
    }
  };

  validateTexts = ({ templateNameText, directoryNameText, instanceNameText }) => {
    const { isNewInstance } = this.props;
    let instanceNameError = false;
    if (isNewInstance) {
      const instanceNameMatches = constants.FILE_NAME_VALID_REGEXP.exec(instanceNameText);
      instanceNameError = !instanceNameText || !instanceNameMatches;
    }
    const validationResult = validateFileNameAndDirectoryName(templateNameText, directoryNameText);
    return {
      instanceNameError,
      pageNameError: validationResult.fileNameHasError,
      directoryNameError: validationResult.directoryNameHasError,
    };
  };

  handleTemplateNameChange = (e) => {
    const templateNameText = e.target.value;
    const newState = {
      templateNameText,
      ...this.validateTexts({
        templateNameText,
        directoryNameText: this.state.directoryNameText,
        instanceNameText: this.state.instanceNameText,
      })
    };
    this.setState(newState);
  };

  handleDirectoryNameChange = (e) => {
    const directoryNameText = e.target.value;
    const newState = {
      directoryNameText,
      ...this.validateTexts({
        templateNameText: this.state.templateNameText,
        instanceNameText: this.state.instanceNameText,
        directoryNameText
      })
    };
    this.setState(newState);
  };

  handleInstanceNameChange = (e) => {
    const instanceNameText = e.target.value;
    const newState = {
      instanceNameText,
      ...this.validateTexts({
        templateNameText: this.state.templateNameText,
        directoryNameText: this.state.directoryNameText,
        instanceNameText,
      })
    };
    this.setState(newState);
  };

  render () {
    const { isOpen, isNewInstance } = this.props;
    if (!isOpen) {
      return null;
    }
    const {
      templateNameText,
      templateNameError,
      directoryNameText,
      directoryNameError,
      instanceNameText,
      instanceNameError
    } = this.state;
    return (
      <Dialog
        aria-labelledby="NewTemplateDialog-dialog-title"
        onClose={this.handleClose}
        open={isOpen}
        maxWidth="sm"
        fullWidth={true}
      >
        <form onSubmit={this.handleSubmit}>
          <DialogTitle
            id="NewTemplateDialog-dialog-title"
            disableTypography={true}
          >
            Create New Template
          </DialogTitle>
          <DialogContent>
            {isNewInstance && (
              <TextField
                autoFocus={true}
                margin="dense"
                id="instanceName"
                label="Instance Name"
                type="text"
                fullWidth={true}
                required={true}
                value={instanceNameText}
                error={instanceNameError}
                onChange={this.handleInstanceNameChange}
                InputProps={{
                  startAdornment:
                    <InputAdornment position="start">
                      <ResourceIcon resourceType={constants.GRAPH_MODEL_COMPONENT_INSTANCE_TYPE}/>
                    </InputAdornment>,
                }}
                helperText="Enter the name on the new instance. Use alphanumeric characters."
              />
            )}
            <TextField
              autoFocus={!isNewInstance}
              margin="dense"
              id="templateName"
              label="Template Name"
              type="text"
              fullWidth={true}
              required={true}
              value={templateNameText}
              error={templateNameError}
              onChange={this.handleTemplateNameChange}
              InputProps={{
                startAdornment:
                  <InputAdornment position="start">
                    <ResourceIcon resourceType={constants.GRAPH_MODEL_TEMPLATE_TYPE}/>
                  </InputAdornment>,
              }}
              helperText="Enter the name on the new template. Use alphanumeric characters and '_', '-' characters."
            />
            <TextField
              margin="dense"
              id="directory"
              label="Path (optional)"
              type="text"
              fullWidth={true}
              required={false}
              value={directoryNameText}
              error={directoryNameError}
              onChange={this.handleDirectoryNameChange}
              InputProps={{
                startAdornment:
                  <InputAdornment position="start">
                    <ResourceIcon resourceType={constants.GRAPH_MODEL_DIR_TYPE} isMuted={true}/>
                  </InputAdornment>,
              }}
              helperText="Enter the path. Use '/' as a separator of the nested directories."
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose} color="secondary">
              Cancel
            </Button>
            <Button type="submit" onClick={this.handleSubmit} color="primary">
              Create
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    );
  }
}

export default NewTemplateDialog;
