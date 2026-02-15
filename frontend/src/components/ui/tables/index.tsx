import { For } from 'solid-js'
import { Component } from 'solid-js'

const Table: Component<{
  data: Array<any>
  columns: Array<string | { name: string; label: string; render: Component }>
}> = (props) => {
  return (
    <table>
      <thead>
        <tr>
          <For each={props.columns}>
            {(c) => <th>{typeof c === 'string' ? c : c.label === '' ? c.name : c.label}</th>}
          </For>
        </tr>
      </thead>
      <tbody>
        <For each={props.data}>
          {(row) => (
            <tr>
              <For each={props.columns}>
                {(c) => <td>{typeof c === 'string' ? row[c] : c.render(row[c.name])}</td>}
              </For>
            </tr>
          )}
        </For>
      </tbody>
    </table>
  )
}

export default Table
