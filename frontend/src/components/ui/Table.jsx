const Table = ({ columns, data, onAction }) => {
  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        
        {/* Header Tabel */}
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col, index) => (
              <th 
                key={index} 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        {/* Isi Tabel */}
        <tbody className="bg-white divide-y divide-gray-200">
          {data.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50">
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {/* Jika kolom memiliki fungsi render khusus (seperti tombol status), gunakan itu. Jika tidak, tampilkan teks biasa */}
                    {col.render ? col.render(row, rowIndex) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="px-6 py-4 text-center text-sm text-gray-500">
                Tidak ada data.
              </td>
            </tr>
          )}
        </tbody>
        
      </table>
    </div>
  );
};

export default Table;