export default function createQuery(path: string, queries: object) {
  var tempString: string = path + "?";
  for (var query in queries) {
    tempString += query + "=" + queries[query] + "&";
  }
  return tempString.slice(0, -1);
}
