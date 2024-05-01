\* Sorry, this document is machine-translated and not post-edited yet

## How to Export Tone Files

You can export the tone of unique NPCs in the same format as custom tone files.

To do this, you'll use the developer console, so please launch the game from `index.html` in your browser.

Also, make sure to load `empty.js` from the distribution folder (a tone file with all fields empty) into the game.

### 1. Use the Investigation Feature of Plustalk to Find Conversation Pattern IDs

Using the investigation feature described on the [Tone Modification Methods](USAGE_en.md) page, find the conversation pattern IDs of the NPC whose tone you want to download.

The sequence of four numbers represents [Pattern, Talk, SubPattern, OverridePattern] IDs, but for downloading, you'll use Pattern, SubPattern, and OverridePattern.

### 2. Call the Export Function in the Developer Console

By executing the following code in the developer console, using the file ID of `empty.js` as `emptyTalkId`, you can export the tone file (it will be treated as a download by the browser).
\* Please execute after loading is complete and the title screen is displayed

```js
plustalk.downloadTalkText(emptyTalkId, Pattern, SubPattern, OverridePattern)
```

For example, if you've loaded `empty.js` as `10006.js` and want to download the tone file for Chardeau (conversation pattern [1015, 1015, null, 19]), it would be like this:

```js
plustalk.downloadTalkText(10006, 1015, null, 19)
```


