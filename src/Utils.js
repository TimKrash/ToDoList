export default class Utils {
  static editEachWord(string, lower=false) {
    let words = string.trim().split(/\s+/);
    for (let i = 0; i < words.length; i++) {
      if (lower) {
        words[i] = words[i][0].toLowerCase() + words[i].substr(1);
      } else {
        words[i] = words[i][0].toUpperCase() + words[i].substr(1);
      }
    }
    words = words.join(" ");

    return words;
  }
}
