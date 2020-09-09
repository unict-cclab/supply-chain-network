import React, { Component } from 'react';

const states = {
    1 : "Unblocked",
    2 : "Batch Blocked",
    3 : "Product Blocked",
    4 : "Batch And Product Blocked",
    5 : "Pending",
    6 : "Processed"
}

export default class BatchHistoryItem extends Component {
  render() {
    return (
        <tr>
            <td>{states[this.props.batchHistoryItem.Value.currentState]}</td>
            <td>{this.props.batchHistoryItem.Value.currentOwnerOrgId || "None"}</td>
            <td>{this.props.batchHistoryItem.Value.currentBlockerOrgId || "None"}</td>
            <td>{this.props.batchHistoryItem.Value.currentReceiverOrgId || "None"}</td>
            <td>{this.props.batchHistoryItem.Value.outputBatchId || "None"}</td>
        </tr>
      );
  }
}