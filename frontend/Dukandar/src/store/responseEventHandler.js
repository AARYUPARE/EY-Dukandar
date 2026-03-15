import { productsAction, toggleCardContainersActions, kioskStoreListActions } from "./store"

const responceEventHandler = (event, dispatch= () => {}) => {

    const {type, payload} = event

    console.log("Enven Received: ", type)

    if(type == "SHOW_PRODUCT")
    {
        if (Array.isArray(payload.products) && payload.products.length != 0) {
        dispatch(productsAction.addProducts(payload.products))
        dispatch(toggleCardContainersActions.showProducts());
      }
    }
    
    if(type == "SHOW_STORES")
    {
        if (Array.isArray(payload.stores) ? payload.stores.length != 0 : false) {
        dispatch(kioskStoreListActions.addKioskStores({ stores: payload.stores || [] }));
        dispatch(toggleCardContainersActions.showStores());
      }
    }

}

export default responceEventHandler