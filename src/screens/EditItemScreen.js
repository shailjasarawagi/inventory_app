import React, { useEffect, useCallback, useReducer } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Platform,
  Alert,
  KeyboardAvoidingView
} from 'react-native';
import { useSelector } from 'react-redux'
import { HeaderButtons, Item } from 'react-navigation-header-buttons';
import HeaderButton from '../components/Component/HeaderButton';
import { useDispatch } from 'react-redux';
import * as itemsActions from '../store/actions/items';
import Input from '../components/UI/Input';
import { Button } from 'react-native-paper';
import IconButton from '../components/Component/IconButton';
const FORM_INPUT_UPDATE = 'FORM_INPUT_UPDATE';

const formReducer = (state, action) => {
  if (action.type === FORM_INPUT_UPDATE) {
    const updatedValues = {
      ...state.inputValues,
      [action.input]: action.value
    };

    return {
      inputValues: updatedValues
    };
  }
  return state;
};


const EditItemScreen = props => {
  const dispatch = useDispatch();
  const itemId = props.navigation.getParam('itemId');
  // console.log("Editscreen ", itemId)
  let editedItem = null;
  let deleteComponent = null;
  if (itemId) {
    editedItem = useSelector(state =>
      state.items.items.find(item => {
        // console.log("in edit screen", item._id, itemId)
        if (item._id === itemId) {
          return item;
        }
      }
      )
    )

    const deleteHandler = useCallback(() => {
      let action =
        itemsActions.deleteItem(
          itemId
        )

      Alert.alert(
        "DELETE ITEM",
        "Are you sure?",
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "OK", onPress: async () => {
              try {
                await dispatch(action);
                props.navigation.navigate('ManageInventory')
              } catch (err) {
                Alert.alert("ERROR", "Something went wrong cannot delete")
              }
            }
          }
        ],
        { cancelable: false }
      )



    }, [dispatch]);

    deleteComponent = <IconButton
      iconValue="ios-trash"
      iconColor="#dd0000"
      onPressHandler={deleteHandler}
    // icon="delete"
    // color="red"
    // size={60}
    // onPress={deleteHandler}
    // style={{ flex: 1, width: "100%" }}
    />
  }

  const [formState, dispatchFormState] = useReducer(formReducer, {
    inputValues: {
      title: editedItem ? editedItem.title : '',
      company: editedItem ? editedItem.company : '',
      description: editedItem ? editedItem.description : '',
      quantity: editedItem ? editedItem.quantity : '',
      price: editedItem ? editedItem.price : ''
    }
  });

  const submitHandler = useCallback(() => {

    if (editedItem) {
      console.log("image", editedItem.image)
      dispatch(
        itemsActions.updateItem(
          itemId,
          formState.inputValues.title,
          formState.inputValues.company,
          +formState.inputValues.quantity,
          formState.inputValues.description,
          +formState.inputValues.price,
          editedItem.image
        )
      );
    } else {

      dispatch(
        itemsActions.addItems(
          formState.inputValues.title,
          formState.inputValues.company,
          +formState.inputValues.quantity,
          formState.inputValues.description,
          +formState.inputValues.price
        )
      );
    }
    props.navigation.goBack();
  }, [dispatch, formState]);

  useEffect(() => {
    props.navigation.setParams({ submit: submitHandler });
  }, [submitHandler]);

  const inputChangeHandler = useCallback(
    (inputIdentifier, inputValue) => {
      dispatchFormState({
        type: FORM_INPUT_UPDATE,
        value: inputValue,
        input: inputIdentifier
      });
    },
    [dispatchFormState]
  );


  return (
    <KeyboardAvoidingView
      behavior="padding"
      keyboardVerticalOffset={20}
    >
      <ScrollView>
        <View style={styles.form}>
          <Input
            id="title"
            label="Item/Medicine Name"
            errorText="Please enter a valid title!"
            keyboardType="default"
            autoCapitalize="sentences"
            autoCorrect
            onInputChange={inputChangeHandler}
            returnKeyType="next"
            initialValue={editedItem ? editedItem.title : ''}
            required
          />
          <Input
            id="company"
            label="Manufactured By"
            errorText="Please enter a valid Company Name!"
            keyboardType="default"
            autoCapitalize="sentences"
            onInputChange={inputChangeHandler}
            autoCorrect
            initialValue={editedItem ? editedItem.company : ''}
            returnKeyType="next"
            required
          />
          <Input
            id="quantity"
            label="Quantity in pcs"
            errorText="Please enter a valid image url!"
            keyboardType="numeric"
            onInputChange={inputChangeHandler}
            returnKeyType="next"
            initialValue={editedItem ? `${editedItem.quantity}` : ''}
            required
          />

          <Input
            id="price"
            label="Price/pc"
            errorText="Please enter a valid price!"
            keyboardType="decimal-pad"
            returnKeyType="next"
            onInputChange={inputChangeHandler}
            required
            initialValue={editedItem ? `${editedItem.price}` : ''}
            min={0.1}
          />

          <Input
            id="description"
            label="Description"
            errorText="Please enter a valid description!"
            keyboardType="default"
            autoCapitalize="sentences"
            autoCorrect
            multiline
            initialValue={editedItem ? editedItem.description[0] : ''}
            onInputChange={inputChangeHandler}
            numberOfLines={3}
            required
            minLength={5}
          />
          {deleteComponent}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

EditItemScreen.navigationOptions = navData => {
  const submitFn = navData.navigation.getParam('submit');
  return {
    headerTitle: 'Add Product',
    headerRight: () => (
      <HeaderButtons HeaderButtonComponent={HeaderButton}>
        <Item
          title="Save"
          iconName={
            Platform.OS === 'android' ? 'md-checkmark' : 'ios-checkmark'
          }
          onPress={submitFn}
        />
      </HeaderButtons>
    )
  };
};

const styles = StyleSheet.create({
  form: {
    margin: 20
  }
});
export default EditItemScreen;