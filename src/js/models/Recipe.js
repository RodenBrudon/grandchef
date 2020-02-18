import axios from 'axios';

export default class Recipe{
    constructor(id){
        this.id = id;
    }

    async getRecipe(){
        try{
            const res = await axios(`https://forkify-api.herokuapp.com/api/get?rId=${this.id}`);
            this.title = res.data.recipe.title;
            this.author = res.data.recipe.publisher;
            this.img = res.data.recipe.image_url;
            this.url = res.data.recipe.source_url;
            this.ingredients = res.data.recipe.ingredients;
            // console.log(res);
            // console.log(this.result);
        }catch (error){
            console.log(error);
            alert('There is a problem')
        }
    }
// Function to calc cooking time. 15min per 3 ingredients
    calcTime(){
        const numIng = this.ingredients.length;
        const period = Math.ceil(numIng/3);
        this.time = period * 15;
    }
    calcServings(){
        this.servings = 4;
    }

    parseIngredients(){

        const unitsLong = ['tablespoons', 'tablespoon', 'ounces', 'ounce', 'teaspoons', 'teaspoon', 'cups', 'pounds'];
        const unitsShort = ['tbsp', 'tbsp', 'oz', 'oz', 'tsp', 'tsp', 'cup', 'pound'];
        const units = [...unitsShort, 'kg', 'g']
        const newIngredients = this.ingredients.map(el => {
            // uniform units
            let ingredient = el.toLowerCase();
            // console.log(ingredient);
            unitsLong.forEach((unit,i)=> {
                ingredient = ingredient.replace(unit, unitsShort[i]);
            });
            // console.log(ingredient);

            // remove parentheses
            ingredient = ingredient.replace(/ *\([^)]*\) */g, ' ');

            // parse ingredients into count, unit and ingredient
            const arrIng = ingredient.split(' ');
            // console.log(arrIng);
            const unitIndex = arrIng.findIndex(el2 => units.includes(el2));
            // console.log(unitIndex);
            
            let  objIng;
            if (unitIndex > -1){
                // there is a unit
                // eg 4 1/2 cups, is arrCount [4, 1/2]
                // eg 4 cups, arrCount is [4]
                const arrCount = arrIng.slice(0, unitIndex);
                // console.log(arrCount);
                let count;
                if (arrCount.length === 1){
                    count = eval(arrIng[0].replace('-', '+'));
                } else {
                    // eval() evaluates a string like a js code. "4+1/2"=> 4.5
                    count = eval(arrIng.slice(0, unitIndex).join('+'));
                }

                objIng= {
                    // count: count, => just 'count,'
                    count,
                    unit: arrIng[unitIndex],
                    ingredient: arrIng.slice(unitIndex + 1).join(' '),

                }

            } else if (parseInt(arrIng[0],10)){
                // No unit, but the 2st el is a number
                objIng = {
                    count: parseInt(arrIng[0],10),
                    unit: '',
                    ingredient: arrIng.slice(1).join(' '),
                }
            } 
            else if (unitIndex === -1){
                // there is no unit and no number in 1st position
                objIng = {
                    count: 1,
                    unit: '',
                    ingredient
                }
            }


            return objIng;
        });
        this.ingredients = newIngredients;
    }

    updateServings(type){
        // Servings
        const newServings = type === 'dec' ? this.servings -1 : this.servings + 1;
        // Ingredients
        this.ingredients.forEach(ing => {
            ing.count *= (newServings/this.servings); 
        });

        this.servings = newServings;
    }
}