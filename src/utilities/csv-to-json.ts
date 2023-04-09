type CsvData<T> = {
  [P in keyof T]: T[P]
}

function parseValue(value: string) {
  return isNaN(+value) ? value : +value
}

export function csvToJson<T>(data: string, delimiter = ';'): T[] {
  const titles = data.slice(0, data.indexOf('\n')).split(delimiter)
  return data
    .slice(data.indexOf('\n') + 1)
    .split('\n')
    .map((v) => {
      const values = v.split(delimiter)
      return titles.reduce(
        (obj, title, index) => (
          (obj[title as keyof T] = parseValue(values[index]) as T[keyof T]), obj
        ),
        {} as T
      )
    })
}
