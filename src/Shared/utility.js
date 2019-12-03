export const updateObj = (oldObj, updatedPropertys) => {
    return {
        ...oldObj,
        ...updatedPropertys,
    };
};