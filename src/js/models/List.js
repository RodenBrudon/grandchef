import uniqid from 'uniqid';

// A class for the shopping list items
export default class List{
    constructor(){
        this.items = [];

    }

    addItem (count, unit, ingredient){
        const item = {
            id: uniqid(),
            count,
            unit,
            ingredient
            // package to create unique IDs: 'uniqid'
        }
        this.items.push(item);
        return item;
    }

    deleteItem (id){
        const index = this.items.findIndex(el => el.id === id)
        // splice vs slice: splice returns the item from the array and mutates 
        // the array. Slice returns the item, but doesnt mutate the array.
        this.items.splice(index,1);
    }

    updateCount(id, newCount){
        this.items.find(el => el.id === id).count = newCount;
    }
}