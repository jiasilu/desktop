// Copyright (c) 2015-2016 Yuya Ochiai
// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import PropTypes from 'prop-types';
import {Modal} from 'react-bootstrap';

import DestructiveConfirmationModal from './DestructiveConfirmModal.jsx';

export default function RemoveServerModal(props) {
  const {serverName, ...rest} = props;
  return (
    <DestructiveConfirmationModal
      {...rest}
      title='移除服务器'
      acceptLabel='移除'
      cancelLabel='取消'
      body={(
        <Modal.Body>
          <p>
            {'将服务器从您的应用中移除，但是不会删除任何数据' +
          ' - 您可以随时将服务器添加回来。'}
          </p>
          <p>
            {'请确认您要移除 '}<strong>{serverName}</strong>{' 服务器?'}
          </p>
        </Modal.Body>
      )}
    />
  );
}

RemoveServerModal.propTypes = {
  serverName: PropTypes.string.isRequired,
};
