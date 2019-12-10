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


// import React from 'react';
// import { Storage } from 'aws-amplify' 

// class App extends React.Component {
  // onChange(e) {
  //   const file = e.target.files[0];
  //   console.log('file: ', file)
  //   Storage.put(file.name, file)
  //   .then (result => console.log(result))
  //   .catch(err => console.log(err));
  // }

//   render() {
//     return (
//       <input
//         type="file" accept='image/png'
//         onChange={(e) => this.onChange(e)}
//       />
//     )
//   }
// }

// export default App;