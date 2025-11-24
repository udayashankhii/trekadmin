import React from 'react';

const Table = ({ columns, data }) => (
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead>
        <tr className="border-b border-slate-200">
          {columns.map((col, idx) => (
            <th
              key={idx}
              className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
            >
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-200">
        {data.map((row, rowIdx) => (
          <tr key={rowIdx} className="hover:bg-slate-50 transition-colors">
            {columns.map((col, colIdx) => (
              <td key={colIdx} className="px-6 py-4 text-sm text-slate-900">
                {col.render ? col.render(row) : row[col.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default Table
