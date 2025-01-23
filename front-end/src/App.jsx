import { useEffect, useState } from "react"


function App() {

  const [data, setData] = useState(null)

  useEffect(() => {
    fetch('http://localhost:8080').then(res => res.text()).then(data => setData(data)).catch(err => console.log(err))

  }, [])

  return (
    <>
      Testing for api calls: 

      <div>
        {data === null ? "Loading" : data}
      </div>
    </>
  )
}

export default App
