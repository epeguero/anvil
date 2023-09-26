import * as prettier from 'prettier';


const code = 
`import React, {useState, JSX} from 'react';

  export default function Increment(): JSX.Element { const [n, setN] = useState<(0); return ( <><button onClick={() => setN(n-1)}></button><div>{n}</div></>);
}
  
`;

prettier.format(code, {parser: 'typescript'})
  .then(console.log)