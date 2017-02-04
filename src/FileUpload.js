import React, { Component } from 'react';
import firebase from 'firebase';

class FileUpload extends Component {
  constructor () {
    super();
    this.state = {
      uploadValue: 0
    };

    this.handleOnChange = this.handleOnChange.bind(this);
  }

  handleOnChange (event) {
    const file = event.target.files[0];
    const storageRef = firebase.storage().ref(`fotos/${file.name}`);
    const task = storageRef.put(file);

    // Listener que se ocupa del estado de la carga del fichero
    task.on('state_changed', snapshot => {
      let percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

      this.setState({
        uploadValue: percentage
      })
    }, error => {
      console.error(error.message);
    }, () => {
      // Subida completada
      this.setState({
        picture: task.snapshot.downloadURL
      });
    });
  }

  render () {
    return (
      <div>
        <progress value={this.state.uploadValue} max='100'>
          {this.state.uploadValue} %
        </progress>
        <br/>
        <input type="file" onChange={this.handleOnChange} />
        <br/>
        <img width="320" src={this.state.picture} alt=""/>
      </div>
    )
  }
}

export default FileUpload;
