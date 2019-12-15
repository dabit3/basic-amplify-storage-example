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
? Do you want to add a Lambda Trigger for your S3 Bucket? N
```

### Configure the React app with Amplify

Open __src/index.js__ and add the following three lines of code:

```js
// src/index.js
import Amplify from 'aws-amplify'
import config from './aws-exports'
Amplify.configure(config)
```

## Platform specific components

### Photo Picker

```js
import React from 'react';
import { Storage } from 'aws-amplify' 
import { PhotoPicker } from 'aws-amplify-react';

class App extends React.Component {
  state = {
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

### Manually working with the Storage API - storing an image

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

### Lambda Trigger for resizing images

Let's add a new Lambda function that will resize an image whenever we upload one to S3 to create thumbnails.

```sh
$ amplify update storage
? Please select from one of the below mentioned services: Content
? Who should have access: Auth & Guest users
? What kind of access do you want for Authenticated users? keep existing settings
? What kind of access do you want for Guest users? keep existing settings
? Do you want to add a Lambda Trigger for your S3 Bucket? Y
? Select from the following options: Create a new function
? Do you want to edit the local S3Triggerf985d3b6 lambda function now? Y
```

Let's update the function to resize images. Update this file with the following code:

```js
//  amplify/backend/function/<function_name>/src/index.js.
const sharp = require('sharp')
const aws = require('aws-sdk')
const s3 = new aws.S3()

const WIDTH = 100
const HEIGHT = 100

exports.handler = async (event, context) => {
  const BUCKET = event.Records[0].s3.bucket.name

  // Get the image data we will use from the first record in the event object
  const KEY = event.Records[0].s3.object.key
  const PARTS = KEY.split('/')

  // Check to see if the base folder is already set to thumbnails, if it is we return so we do not have a recursive call.
  const BASE_FOLDER = PARTS[0]
  if (BASE_FOLDER === 'thumbnails') return

  // Stores the main file name in a variable
  let FILE = PARTS[PARTS.length - 1]

  try {
    const image = await s3.getObject({ Bucket: BUCKET, Key: KEY }).promise()

    const resizedImg = await sharp(image.Body).resize(WIDTH, HEIGHT).toBuffer()

    await s3.putObject({ Bucket: BUCKET, Body: resizedImg, Key: `thumbnails/thumbnail-${FILE}` }).promise()

    return
  }
  catch(err) {
    context.fail(`Error resizing files: ${err}`);
  }
}
```

Next, we need to make sure that the `sharp` library is installed. To do so, you can add a dependency in the `package.json` of the function.

#### amplify/backend/function/<function_name>/src/package.json

```json
"scripts": {
  "install": "npm install --arch=x64 --platform=linux --target=10.15.0 sharp"
},
"dependencies": {
  "sharp": "^0.23.2"
}
```

Finally, for sharp to work, we need to update the Node.js runtime to be __10.x__. To do so, open __/amplify/backend/function/S3Triggerf985d3b6/<function-name>-cloudformation-template.json__ and update the __Runtime__ key:

```json
"Runtime": "nodejs10.x",
```

Now, to deploy the updated function, run the `push` command:

```sh
$ amplify push
```