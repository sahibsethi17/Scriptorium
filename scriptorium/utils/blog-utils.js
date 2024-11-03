// Utils for the blog endpoints

// SOURCE: https://builtin.com/software-engineering-perspectives/remove-duplicates-from-array-javascript -- how to remove duplicates from array in JS
export function removeDuplicateTags(tags) {
    const tagArray = tags.split(',');
    for (let i = 0; i < tagArray.length; i++) {
        tagArray[i] = tagArray[i].trim();
    }
    return [...new Set(tagArray)].join(",");
}

export function convertToArray(templateIds) {
    const templateIdArray = templateIds.split(',');
    for (let i = 0; i < templateIdArray.length; i++) {
        templateIdArray[i] = Number(templateIdArray[i]);
    }
    return templateIdArray;
}