import { createSlice } from "@reduxjs/toolkit";

const showcaseSlice = createSlice(
  {
    name: "showcase",

    initialState:
    {

    },
    reducers:
    {
      setShowcase(state, action) {
        return action.payload;
      },

      clearShowcase(state, action) {
        return {}
      }
    }

  }
)

export default showcaseSlice