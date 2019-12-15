## Basic Storage example with AWS Amplify

Storing & querying for files with AWS Amplify and React

> The code in this app should be used for reference, but to recreate the app follow the below steps. You can also recreate this project by cloning it and running `amplify init`.

## Getting started

Create a new React app:

```sh
$ npx create-react-app my-app

$ cd my-app
```

Install the Amplify libraries:

```sh
$ npm install aws-amplify aws-amplify-react
```

Initialize a new amplify app:

```sh
$ amplify init
```

Next, add auth:

```sh
$ amplify add auth

? Do you want to use the default authentication and security configuration? Default configuration
? How do you want users to be able to sign in? Username
? Do you want to configure advanced settings? No
```

Next, add storage with Amazon S3:

```sh
$ amplify add storage
? Please select from one of the below mentioned services: Content
? Please provide a friendly name for your resource that will be used to label this category in the project: <resource_name>
? Please provide bucket name: <unique_bucket_name>
? Who should have access: Auth and guest users
? What kind of access do you want for Authenticated users? create, update, read, delete
? What kind of access do you want for Guest users? create, update, read, delete
? Do you want to add a Lambda Trigger for your S3 Bucket? Y
? Select from the following options: Create a new function
? Do you want to edit the local S3Trigger751aed92 lambda function now? N
```

### Configure the React app with Amplify

Open __src/index.js__ and add the following three lines of code:

```js
// src/index.js
import Amplify from 'aws-amplify'
import config from './aws-exports'
Amplify.configure(config)
```

### Storing an image

```js
// src/App.js
import React from 'react';
import { Storage } from 'aws-amplify' 

class App extends React.Component {
  onChange(e) {
    const file = e.target.files[0];
    Storage.put(file.name, file)
    .then (result => console.log(result))
    .catch(err => console.log(err));
  }

  render() {
    return (
      <input
        type="file" accept='image/png'
        onChange={(e) => this.onChange(e)}
      />
    )
  }
}

export default App;
```

### Viewing a single file or image from a folder or array of images

```js
import React from 'react';
import { Storage } from 'aws-amplify' 

class App extends React.Component {
  state = {
    files: [],
    file: ""
  }
  componentDidMount() {
    this.listFiles()
  }
  onChange(e) {
    const file = e.target.files[0]
    Storage.put(file.name, file)
    .then (() => this.listFiles())
    .catch(err => console.log(err));
  }

  listFiles = async () => {
    const files = await Storage.list('')
    this.setState({ files })
  }

  selectFile = async file => {
    const signed = await Storage.get(file.key)
    this.setState({ file: signed })
  }

  render() {
    return (
      <div>
        <input
          type="file" accept='image/png'
          onChange={(e) => this.onChange(e)}
        />
        <button onClick={this.listFiles}>
          List Files
        </button>
        <div>
        {
          this.state.files.map((file, i) => (
           <p onClick={() => this.selectFile(file)}>{file.key}</p>
          ))
        }
        </div>
        {
          this.state.file && (
            <img
              src={this.state.file}
              style={{width: 300}}
            />
          )
        }
      </div>
    )
  }
}

export default App;
```

### Viewing a list of images after storing them

```js
import React from 'react';
import { Storage } from 'aws-amplify' 

class App extends React.Component {
  state = {
    files: []
  }
  onChange(e) {
    const file = e.target.files[0]
    Storage.put(file.name, file)
    .then (() => this.listFiles())
    .catch(err => console.log(err));
  }

  listFiles = async () => {
    const files = await Storage.list('')
    let signedFiles = files.map(f => Storage.get(f.key))
    signedFiles = await Promise.all(signedFiles)
    console.log('signedFiles: ', signedFiles)
    this.setState({ files: signedFiles })
  }

  render() {
    return (
      <div>
        <input
          type="file" accept='image/png'
          onChange={(e) => this.onChange(e)}
        />
        <button onClick={this.listFiles}>
          List Files
        </button>
        <div>
        {
          this.state.files.map((file, i) => (
            <img
              key={i}
              src={file}
              style={{height: 300}}
            />
          ))
        }
        </div>
      </div>
    )
  }
}

export default App;
```

## Platform specific components

### Photo Picker

```js
import React from 'react';
import { Storage } from 'aws-amplify' 
import { PhotoPicker } from 'aws-amplify-react';

class App extends React.Component {
  state = {
    files: [],
    file: {}
  }
  onChange(data) {
    console.log('data: ', data)
    this.setState({ file: data.file })
  }

  saveFile = async () => {
    const { file } = this.state
    await Storage.put(file.name, file)
    console.log('successfully saved file...')
  }

  render() {
    return (
      <div>
        <PhotoPicker
          preview
          onPick={data => this.onChange(data)}
        />
        <button onClick={this.saveFile}>
          Save File
        </button>
        <div>
        {
          this.state.files.map((file, i) => (
           <p onClick={() => this.selectFile(file)}>{file.key}</p>
          ))
        }
        </div>
        
      </div>
    )
  }
}

export default App;
```

### S3 Image


```js
import React from 'react';
import { Storage } from 'aws-amplify' 
import { S3Image } from 'aws-amplify-react';

class App extends React.Component {
  state = {
    files: [],
  }
  
  async componentDidMount() {
    const files = await Storage.list('')
    console.log('files: ', files)
    this.setState({ files })
  }

  render() {
    return (
      <div>
        {
          this.state.files.map((f, i) => (
            <div style={{ width: 400, margin: '0 auto' }} key={i}>
              <S3Image
                imgKey={f.key}
              />
            </div>
          ))
        }        
      </div>
    )
  }
}

export default App;
```

### Photo Album

```js
import React from 'react';
import { S3Album } from 'aws-amplify-react';

class App extends React.Component {
  render() {
    return (
      <div>
        <S3Album path='' />    
      </div>
    )
  }
}

export default App;
```