import React, { Component } from 'react';
import { Link } from 'react-router-dom';

export default class Batch extends Component {
  render() {
    if(this.props.batch.currentState === 1)
        return (
        <>
            <div className="list-group-item list-group-item-action flex-column align-items-start mb-5 border border-dark">
                <label>Id</label>
                <div className="input-group mb-3">
                    <input type="text" className="form-control" aria-describedby="basic-addon3" value={this.props.batch.id} disabled></input>
                </div>
                <label>Product Name</label>
                <div className="input-group mb-3">
                    <input type="text" className="form-control" aria-describedby="basic-addon3" value={this.props.batch.productName} disabled></input>
                </div>
                <label>Batch Ingredients</label>
                <div className="input-group mb-3">
                    <textarea type="text" className="form-control" aria-describedby="basic-addon3" rows="5"
                        value={this.props.batch.batchIngredientIds.length > 0 ? (this.props.batch.batchIngredientIds.join("\n")) : ("None")}
                        disabled>
                    </textarea>
                </div>
                <label>Current State</label>
                <div className="input-group mb-3">
                    <input type="text" className="form-control" aria-describedby="basic-addon3" value="Unblocked" disabled></input>
                </div>
                <label>Current Owner Organization</label>
                <div className="input-group mb-3">
                    <input type="text" className="form-control" aria-describedby="basic-addon3" value={this.props.batch.currentOwnerOrgId} disabled></input>
                </div>
                <label>Current Blocker Organization</label>
                <div className="input-group mb-3">
                    <input type="text" className="form-control" aria-describedby="basic-addon3"  value="None" disabled></input>
                </div>
                <label>Current Receiver Organization</label>
                <div className="input-group mb-3">
                    <input type="text" className="form-control" aria-describedby="basic-addon3"  value="None" disabled></input>
                </div>
                <label>Output Batch</label>
                <div className="input-group mb-3">
                    <input type="text" className="form-control" aria-describedby="basic-addon3"  value="None" disabled></input>
                </div>
                <div className="input-group mb-3">
                    <button className="btn btn-light btn-block border mr-5 ml-5" style={{backgroundColor: "#e3f2fd"}} onClick={this.props.blockBatch.bind(this, this.props.batch.id)}>Block Batch</button>
                    <button className="btn btn-light btn-block border mr-5 ml-5" style={{backgroundColor: "#e3f2fd"}} onClick={this.props.requestBatchTransfer.bind(this, this.props.batch.id)}>Request Batch Transfer</button>
                    <Link to={"/batches/"+this.props.batch.id+"/history"} className="btn btn-light btn-block mr-5 ml-5 border" style={{backgroundColor: "#e3f2fd"}}>View Batch History</Link>
                </div>
            </div>
        </>
        );
    else if(this.props.batch.currentState === 2)
        return (
            <>
                <div className="list-group-item list-group-item-action flex-column align-items-start mb-5 border border-dark">
                    <label>Id</label>
                    <div className="input-group mb-3">
                        <input type="text" className="form-control" aria-describedby="basic-addon3" value={this.props.batch.id} disabled></input>
                    </div>
                    <label>Product Name</label>
                    <div className="input-group mb-3">
                        <input type="text" className="form-control" aria-describedby="basic-addon3" value={this.props.batch.productName} disabled></input>
                    </div>
                    <label>Batch Ingredients</label>
                    <div className="input-group mb-3">
                        <textarea type="text" className="form-control" aria-describedby="basic-addon3" rows="5"
                            value={this.props.batch.batchIngredientIds.length > 0 ? (this.props.batch.batchIngredientIds.join("\n")) : ("None")}
                            disabled>
                        </textarea>
                    </div>
                    <label>Current State</label>
                    <div className="input-group mb-3">
                        <input type="text" className="form-control" aria-describedby="basic-addon3" value="Batch Blocked" disabled></input>
                    </div>
                    <label>Current Owner Organization</label>
                    <div className="input-group mb-3">
                        <input type="text" className="form-control" aria-describedby="basic-addon3" value={this.props.batch.currentOwnerOrgId} disabled></input>
                    </div>
                    <label>Current Blocker Organization</label>
                    <div className="input-group mb-3">
                        <input type="text" className="form-control" aria-describedby="basic-addon3"  value={this.props.batch.currentBlockerOrgId} disabled></input>
                    </div>
                    <label>Current Receiver Organization</label>
                    <div className="input-group mb-3">
                        <input type="text" className="form-control" aria-describedby="basic-addon3"  value="None" disabled></input>
                    </div>
                    <label>Output Batch</label>
                    <div className="input-group mb-3">
                        <input type="text" className="form-control" aria-describedby="basic-addon3"  value="None" disabled></input>
                    </div>
                    <div className="input-group mb-3">
                        <button className="btn btn-light btn-block border mr-5 ml-5" style={{backgroundColor: "#e3f2fd"}} onClick={this.props.unblockBatch.bind(this, this.props.batch.id)}>Unblock Batch</button>
                        <Link to={"/batches/"+this.props.batch.id+"/history"} className="btn btn-light btn-block mr-5 ml-5 border" style={{backgroundColor: "#e3f2fd"}}>View Batch History</Link>
                    </div>
                </div>
            </>
        );
    else if(this.props.batch.currentState === 3)
        return (
            <>
                <div className="list-group-item list-group-item-action flex-column align-items-start mb-5 border border-dark">
                    <label>Id</label>
                    <div className="input-group mb-3">
                        <input type="text" className="form-control" aria-describedby="basic-addon3" value={this.props.batch.id} disabled></input>
                    </div>
                    <label>Product Name</label>
                    <div className="input-group mb-3">
                        <input type="text" className="form-control" aria-describedby="basic-addon3" value={this.props.batch.productName} disabled></input>
                    </div>
                    <label>Batch Ingredients</label>
                    <div className="input-group mb-3">
                        <textarea type="text" className="form-control" aria-describedby="basic-addon3" rows="5"
                            value={this.props.batch.batchIngredientIds.length > 0 ? (this.props.batch.batchIngredientIds.join("\n")) : ("None")}
                            disabled>
                        </textarea>
                    </div>
                    <label>Current State</label>
                    <div className="input-group mb-3">
                        <input type="text" className="form-control" aria-describedby="basic-addon3" value="Product Blocked" disabled></input>
                    </div>
                    <label>Current Owner Organization</label>
                    <div className="input-group mb-3">
                        <input type="text" className="form-control" aria-describedby="basic-addon3" value={this.props.batch.currentOwnerOrgId} disabled></input>
                    </div>
                    <label>Current Blocker Organization</label>
                    <div className="input-group mb-3">
                        <input type="text" className="form-control" aria-describedby="basic-addon3"  value="None" disabled></input>
                    </div>
                    <label>Current Receiver Organization</label>
                    <div className="input-group mb-3">
                        <input type="text" className="form-control" aria-describedby="basic-addon3"  value="None" disabled></input>
                    </div>
                    <label>Output Batch</label>
                    <div className="input-group mb-3">
                        <input type="text" className="form-control" aria-describedby="basic-addon3"  value="None" disabled></input>
                    </div>
                    <div className="input-group mb-3">
                        <button className="btn btn-light btn-block border mr-5 ml-5" style={{backgroundColor: "#e3f2fd"}} onClick={this.props.blockBatch.bind(this, this.props.batch.id)}>Block Batch</button>
                        <Link to={"/batches/"+this.props.batch.id+"/history"} className="btn btn-light btn-block mr-5 ml-5 border" style={{backgroundColor: "#e3f2fd"}}>View Batch History</Link>
                    </div>
                </div>
            </>
        );
    else if(this.props.batch.currentState === 4)
        return (
            <>
                <div className="list-group-item list-group-item-action flex-column align-items-start mb-5 border border-dark">
                    <label>Id</label>
                    <div className="input-group mb-3">
                        <input type="text" className="form-control" aria-describedby="basic-addon3" value={this.props.batch.id} disabled></input>
                    </div>
                    <label>Product Name</label>
                    <div className="input-group mb-3">
                        <input type="text" className="form-control" aria-describedby="basic-addon3" value={this.props.batch.productName} disabled></input>
                    </div>
                    <label>Batch Ingredients</label>
                    <div className="input-group mb-3">
                        <textarea type="text" className="form-control" aria-describedby="basic-addon3" rows="5"
                            value={this.props.batch.batchIngredientIds.length > 0 ? (this.props.batch.batchIngredientIds.join("\n")) : ("None")}
                            disabled>
                        </textarea>
                    </div>
                    <label>Current State</label>
                    <div className="input-group mb-3">
                        <input type="text" className="form-control" aria-describedby="basic-addon3" value="Batch And Product Blocked" disabled></input>
                    </div>
                    <label>Current Owner Organization</label>
                    <div className="input-group mb-3">
                        <input type="text" className="form-control" aria-describedby="basic-addon3" value={this.props.batch.currentOwnerOrgId} disabled></input>
                    </div>
                    <label>Current Blocker Organization</label>
                    <div className="input-group mb-3">
                        <input type="text" className="form-control" aria-describedby="basic-addon3"  value={this.props.batch.currentBlockerOrgId} disabled></input>
                    </div>
                    <label>Current Receiver Organization</label>
                    <div className="input-group mb-3">
                        <input type="text" className="form-control" aria-describedby="basic-addon3"  value="None" disabled></input>
                    </div>
                    <label>Output Batch</label>
                    <div className="input-group mb-3">
                        <input type="text" className="form-control" aria-describedby="basic-addon3"  value="None" disabled></input>
                    </div>
                    <div className="input-group mb-3">
                        <button className="btn btn-light btn-block border mr-5 ml-5" style={{backgroundColor: "#e3f2fd"}} onClick={this.props.unblockBatch.bind(this, this.props.batch.id)}>Unblock Batch</button>
                        <Link to={"/batches/"+this.props.batch.id+"/history"} className="btn btn-light btn-block mr-5 ml-5 border" style={{backgroundColor: "#e3f2fd"}}>View Batch History</Link>
                    </div>
                </div>
            </>
        );
    else if(this.props.batch.currentState === 5)
        return (
            <>
                <div className="list-group-item list-group-item-action flex-column align-items-start mb-5 border border-dark">
                    <label>Id</label>
                    <div className="input-group mb-3">
                        <input type="text" className="form-control" aria-describedby="basic-addon3" value={this.props.batch.id} disabled></input>
                    </div>
                    <label>Product Name</label>
                    <div className="input-group mb-3">
                        <input type="text" className="form-control" aria-describedby="basic-addon3" value={this.props.batch.productName} disabled></input>
                    </div>
                    <label>Batch Ingredients</label>
                    <div className="input-group mb-3">
                        <textarea type="text" className="form-control" aria-describedby="basic-addon3" rows="5"
                            value={this.props.batch.batchIngredientIds.length > 0 ? (this.props.batch.batchIngredientIds.join("\n")) : ("None")}
                            disabled>
                        </textarea>
                    </div>
                    <label>Current State</label>
                    <div className="input-group mb-3">
                        <input type="text" className="form-control" aria-describedby="basic-addon3" value="Pending" disabled></input>
                    </div>
                    <label>Current Owner Organization</label>
                    <div className="input-group mb-3">
                        <input type="text" className="form-control" aria-describedby="basic-addon3" value={this.props.batch.currentOwnerOrgId} disabled></input>
                    </div>
                    <label>Current Blocker Organization</label>
                    <div className="input-group mb-3">
                        <input type="text" className="form-control" aria-describedby="basic-addon3"  value="None" disabled></input>
                    </div>
                    <label>Current Receiver Organization</label>
                    <div className="input-group mb-3">
                        <input type="text" className="form-control" aria-describedby="basic-addon3"  value={this.props.batch.currentReceiverOrgId} disabled></input>
                    </div>
                    <label>Output Batch</label>
                    <div className="input-group mb-3">
                        <input type="text" className="form-control" aria-describedby="basic-addon3"  value="None" disabled></input>
                    </div>
                    <div className="input-group mb-3">
                        <button className="btn btn-light btn-block border mr-5 ml-5" style={{backgroundColor: "#e3f2fd"}} onClick={this.props.acceptBatchTransfer.bind(this, this.props.batch.id)}>Accept Batch Transfer</button>
                        <button className="btn btn-light btn-block border mr-5 ml-5" style={{backgroundColor: "#e3f2fd"}} onClick={this.props.refuseBatchTransfer.bind(this, this.props.batch.id)}>Refuse Batch Transfer</button>
                        <button className="btn btn-light btn-block border mr-5 ml-5" style={{backgroundColor: "#e3f2fd"}} onClick={this.props.blockBatch.bind(this, this.props.batch.id)}>Block Batch</button>
                        <Link to={"/batches/"+this.props.batch.id+"/history"} className="btn btn-light btn-block mr-5 ml-5 border" style={{backgroundColor: "#e3f2fd"}}>View Batch History</Link>
                    </div>
                </div>
            </>
        );
    else if(this.props.batch.currentState === 6)
        return (
            <>
                <div className="list-group-item list-group-item-action flex-column align-items-start mb-5 border border-dark">
                    <label>Id</label>
                    <div className="input-group mb-3">
                        <input type="text" className="form-control" aria-describedby="basic-addon3" value={this.props.batch.id} disabled></input>
                    </div>
                    <label>Product Name</label>
                    <div className="input-group mb-3">
                        <input type="text" className="form-control" aria-describedby="basic-addon3" value={this.props.batch.productName} disabled></input>
                    </div>
                    <label>Batch Ingredients</label>
                    <div className="input-group mb-3">
                        <textarea type="text" className="form-control" aria-describedby="basic-addon3" rows="5"
                            value={this.props.batch.batchIngredientIds.length > 0 ? (this.props.batch.batchIngredientIds.join("\n")) : ("None")}
                            disabled>
                        </textarea>
                    </div>
                    <label>Current State</label>
                    <div className="input-group mb-3">
                        <input type="text" className="form-control" aria-describedby="basic-addon3" value="Processed" disabled></input>
                    </div>
                    <label>Current Owner Organization</label>
                    <div className="input-group mb-3">
                        <input type="text" className="form-control" aria-describedby="basic-addon3" value={this.props.batch.currentOwnerOrgId} disabled></input>
                    </div>
                    <label>Current Blocker Organization</label>
                    <div className="input-group mb-3">
                        <input type="text" className="form-control" aria-describedby="basic-addon3"  value="None" disabled></input>
                    </div>
                    <label>Current Receiver Organization</label>
                    <div className="input-group mb-3">
                        <input type="text" className="form-control" aria-describedby="basic-addon3"  value="None" disabled></input>
                    </div>
                    <label>Output Batch</label>
                    <div className="input-group mb-3">
                        <input type="text" className="form-control" aria-describedby="basic-addon3"  value={this.props.batch.outputBatchId} disabled></input>
                    </div>
                    <div className="input-group mb-3">
                        <Link to={"/batches/"+this.props.batch.id+"/history"} className="btn btn-light btn-block mr-5 ml-5 border" style={{backgroundColor: "#e3f2fd"}}>View Batch History</Link>
                    </div>
                </div>
            </>
        );
  }
}