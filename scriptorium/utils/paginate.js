const ELEMENTS_PER_PAGE = 10

export function paginate(data, pageNum) {
    const lastElement = pageNum * ELEMENTS_PER_PAGE;
    const firstElement = lastElement - ELEMENTS_PER_PAGE;
    return data.slice(firstElement, lastElement)
}
