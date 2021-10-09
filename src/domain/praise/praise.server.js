export default function usePraiseServer() {
    const state = {
        like: 0
    }

    const addLike = (num = 1) => {
        state.like += num
    }

    const reduceLike = (num = 1) => {
        state.like -= num
    }


    return {
        state,
        addLike,
        reduceLike
    }

}