// import str from './models/Search';

// // import {add, mult, ID} from './views/searchView';
// import * as searchView from './views/searchView';
// console.log(`Using imported functions! ${searchView.add(searchView.ID,2)} and ${searchView.mult(2,5)}. ${str}`);

// https://forkify-api.herokuapp.com/api/search

// https://forkify-api.herokuapp.com/api/search?q=pizza

// https://forkify-api.herokuapp.com/api/get?rId=47746

import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';

import { elements, renderLoader, clearLoader } from './views/base';



//** Global state of the app
//*  Search object
//*  Current recipe object
//*  Shopping list object
//*  Liked recipes


const state = {};
/*********  SEARCH CONTROLLER *********/
const controllSearch = async ()=> {
    // 1 get query from view
    const query = searchView.getInput();
    // TESTING
    // const query = 'pizza';

    console.log(query);

    if(query){
        // 2 new search object and add to state
        state.search = new Search(query);

        // 3 prepare UI results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.recipe);

        try{
            // 4 search for recipes
            await state.search.getResults();
    
            // 5 render results on UI
            clearLoader();
            searchView.renderResults(state.search.result);
        } catch(error){
            alert('Something went wrong with the query!');
            clearLoader();
        }
    }
}

elements.searchForm.addEventListener('submit', e=> {
    e.preventDefault();
    controllSearch();
});
// testing
window.addEventListener('load', e=> {
    e.preventDefault();
    controllSearch();
});


//put eventhandler on an element that is present at page load. in this case 'results__pages'
elements.searchResPages.addEventListener('click', e=>{
    const btn = e.target.closest('.btn-inline');
    if(btn){
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
        // console.log(goToPage);
    };
});

/*********  RECIPE CONTROLLER *********/

// const r = new Recipe(47746);
// r.getRecipe();
// console.log(r);

const controllRecipe = async ()=>{
    // Get ID from url
    const id = window.location.hash.replace('#','');
    if(id){
        //prepare UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        // Highlight selected
        if (state.search) searchView.highlightSelected(id);
    

        //create new recipe object
        state.recipe = new Recipe(id);
        // TESTING
        window.r = state.recipe;
        try{
            
        //get recipe data and parse ingredients
            await state.recipe.getRecipe();
            // TEST
            // console.log(state.recipe.ingredients);
            state.recipe.parseIngredients();
    
            // calc servings and time
            state.recipe.calcTime();
            state.recipe.calcServings();
            // console.log(state.recipe);
    
            //render recipe
            clearLoader();
            recipeView.renderRecipe(
                state.recipe,
                state.likes.isLiked(id)
                );
            // console.log(state.recipe);
        } catch (error){
            console.log(error);
            alert('Error in processing recipe!');
        }
    }
}

// listens to a change of the hash (recipe_id)
window.addEventListener('hashchange', controllRecipe);
window.addEventListener('load', controllRecipe);

// ['hashchange', 'load'].forEach(event => window.addEventListener(event, controllRecipe));


//*******List Controller */
const controllList = ()=>{
    // create new list IF there is none yet
    if(!state.list) state.list = new List();

    // add each ingredient to the list and UI
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);

    })
}

// handle delete and update list item events
elements.shopping.addEventListener('click', e =>{
    const id = e.target.closest('.shopping__item').dataset.itemid;

    //handle delete btn
    if(e.target.matches('.shopping__delete, .shopping__delete *')){
        //delete from state
        state.list.deleteItem(id);
        //delete from UI
        listView.deleteItem(id);
        // handle count update
    } else if (e.target.matches('.shopping__count-value')){
        const val = parseFloat(e.target.value, 10);
        state.list.updateCount(id, val);
    }
});



//*******Like Controller */
const controlLike = () => {
    if(!state.likes) state.likes = new Likes();
    const currentID = state.recipe.id;
    
    //User hasnt liked cur recipe yet
    if (!state.likes.isLiked(currentID)){
    // add like to the state
    const newLike = state.likes.addLike(
        currentID, 
        state.recipe.title,
        state.recipe.author, 
        state.recipe.img 
    );

    // toggle the like button
    likesView.toggleLikeBtn(true);

    // add like to UI list
    likesView.renderLike(newLike);
    console.log(state.likes);
        
    //User HAS liked cur recipe yet
    } else {

    // Remove like to the state
    state.likes.deleteLike(currentID);
    // toggle the like button
    likesView.toggleLikeBtn(false);


    // Remove like to UI list
    likesView.deleteLike(currentID);
    console.log(state.likes);


    }
    likesView.toggleLikeMenu(state.likes.getNumLikes());
};

// Restore liked recipe on page load
window.addEventListener('load',()=> {
    state.likes = new Likes();
    // Restore likes
    state.likes.readStorage();
    // toggle like menu button
likesView.toggleLikeMenu(state.likes.getNumLikes());
//render existing likes
state.likes.likes.forEach(like => likesView.renderLike(like));
})

// Recipe button click handler
elements.recipe.addEventListener('click', e =>{
    // * stands for any child element
    if(e.target.matches('.btn-decrease, .btn-decrease *')){
        // decrease
        if(state.recipe.servings > 1){
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }
    } else if (e.target.matches('.btn-increase, .btn-increase *')){
        // increase
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
    }
    // console.log(state.recipe);
    else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')){
        // add ingredient to shopping list
        controllList();
    } else if (e.target.matches('.recipe__love, .recipe__love *')){
        //like controller
        controlLike();
    }
});
