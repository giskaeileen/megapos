import { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setPageTitle } from "../../store/themeConfigSlice";
import { useGetSingleAttributesQuery, useStoreAttributesMutation, useUpdateAttributesMutation } from "../../redux/features/attributes/attributesApi";
import IconX from "../../components/Icon/IconX";

const AttributesForm = () => {
  /*****************************
   * Tools
   */
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);
  const storeId = pathnames[0];
  const entity = pathnames[1];

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(setPageTitle("Attributes Form"));
  });

  const navigate = useNavigate();
  const { id } = useParams();
  const { data } = useGetSingleAttributesQuery(
    { storeId, id },
    { skip: !id }
  ); // Menarik data jika ID ada
  const [updateAttributes, { isSuccess: isUpdateSuccess, error: errorUpdate }] =
    useUpdateAttributesMutation();
  const [storeAttributes, { data: dataStore, isSuccess: isSuccessStore, error: errorStore }] =
    useStoreAttributesMutation();

  /*****************************
   * State for dynamic values
   */
  const [valuesArray, setValuesArray] = useState(
    data?.values || [{ value: "" }]
  );

  useEffect(() => {
    setValuesArray(
        data?.values || [{ value: "" }]
    )
  },[data])

  /*****************************
   * Form Validation
   */
  const schema = Yup.object().shape({
    name: Yup.string().required("Name is required"),
  });

  /*****************************
   * Formik Setup
   */
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: data?.name || "",
      // name: "",
    },
    validationSchema: schema,
    onSubmit: async (values) => {

      if (id) {
        const payload = {
            name: values.name,
            values: valuesArray.filter((v: any) => v.value.trim() !== ""),
            _method: "PUT"
        };
        await updateAttributes({ storeId, id, data: payload });
      } else {
        const payload = {
            name: values.name,
            values: valuesArray.filter((v: any) => v.value.trim() !== ""),
        };
        await storeAttributes({ storeId, data: payload });
      }
    },
  });

  const { errors, touched, values, handleChange, handleSubmit } = formik;

  /*****************************
   * Handlers for Dynamic Values
   */
  const handleAddValue = () => {
    setValuesArray([...valuesArray, { value: "" }]);
  };

  const handleRemoveValue = (index: number) => {
    setValuesArray(valuesArray.filter((_: any, i: number) => i !== index));
  };

  const handleChangeValue = (index: any, newValue: any) => {
    const updatedValues = [...valuesArray];
    updatedValues[index].value = newValue;
    setValuesArray(updatedValues);
  };

  /*****************************
   * Status Handling
   */
  useEffect(() => {
    if (isSuccessStore) {
      toast.success("Create Successfully");
      navigate(`/${storeId}/${entity}/${dataStore?.id}`);
    }
    if (isUpdateSuccess) {
      toast.success("Update Successfully");
    }
    if (errorStore) {
      toast.error((errorStore as any).data.message);
    }
    if (errorUpdate) {
      toast.error((errorUpdate as any).data.message);
    }
  }, [isSuccessStore, isUpdateSuccess, errorStore, errorUpdate]);

  /*****************************
   * Render
   */
  return (
    <form onSubmit={handleSubmit}>
      <div className="flex items-center justify-between flex-wrap gap-4 mb-5">
        <h2 className="text-xl">Attributes</h2>
        <button type="submit" className="btn btn-primary">
          Save
        </button>
      </div>

      <div className="grid lg:grid-cols-6 grid-cols-1 gap-6">
        <div className="panel col-span-6 lg:col-span-4">
          <div className="mb-5">
            <label htmlFor="name">Name<span className="text-danger">*</span></label>
            <input
              id="name"
              type="text"
              placeholder="Enter Name"
              className="form-input"
              value={values.name}
              onChange={handleChange}
            />
            {errors.name && touched.name && typeof errors.name === 'string' && (
              <span className="text-red-500 block mt-2">{errors.name}</span>
            )}
          </div>

          {/* Dynamic Values Section */}
          <div>
            <label htmlFor="name">Values<span className="text-danger">*</span></label>
            {valuesArray.map((item: any, index: number) => (
              <div key={index} className="flex items-center gap-4 mb-3">
                <input
                  type="text"
                  value={item.value}
                  onChange={(e) => handleChangeValue(index, e.target.value)}
                  placeholder="Enter Value"
                  className="form-input flex-1"
                />
                {/* <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => handleRemoveValue(index)}
                >
                  Remove
                </button> */}
                <div 
                    onClick={() => handleRemoveValue(index)}
                    className="cursor-pointer"
                >
                    <IconX/>
                </div>
              </div>
            ))}
            <button
              type="button"
              className="btn btn-secondary mt-3"
              onClick={handleAddValue}
            >
              Add Value
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default AttributesForm;
