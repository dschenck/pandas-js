import React     from 'react'
import ReactDOM  from 'react-dom'
import Immutable from 'immutable'

import Index     from './core/Index.js'

let idx = new Index(Immutable.Range(0, 100).toList(), {name:"Hello world"})
    idx = idx.filter(value => value % 7 != 0).map(value => value + 4)
    idx = idx.mask(idx.map(value => value % 10 == 0))
    idx = idx.reverse().astype("string")

let idx2 = new Index(Immutable.Range(30, 100, 10).toList())
    idx = idx.union(idx2)
    idx = idx.astype("number")
    idx = idx.deduplicate()
    idx = idx.map(val => val + 1)
    idx = idx.sort()

console.log(idx.indices.reduce((prev, curr) => {
    if(curr in prev){
        prev[curr] += 1
    }
    else{
        prev[curr] = 1
    }
    return prev
}, {}))
console.log(idx.duplicates().toList(true))

const App = function(index){
    const elements = index.indices.map((value, i) => {
        return <li key={i}>{value}</li>
    })

    return(
        <div>
            <table>
                <tbody>
                    <tr>
                        <td>Name</td>
                        <td>{index.name}</td>
                    </tr>
                    <tr>
                        <td>Length</td>
                        <td>{index.length}</td>
                    </tr>
                    <tr>
                        <td>min</td>
                        <td>{index.min()}</td>
                    </tr>
                    <tr>
                        <td>max</td>
                        <td>{index.max()}</td>
                    </tr>
                    <tr>
                        <td>dtype</td>
                        <td>{index.dtype}</td>
                    </tr>
                </tbody>
            </table>
            <ul>
                {elements}
            </ul>
        </div>
    )
}

ReactDOM.render(
    App(idx), document.getElementById("root")
)
