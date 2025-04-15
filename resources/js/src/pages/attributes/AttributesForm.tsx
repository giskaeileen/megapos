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
   * Inisialisasi tools
   */
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);
  const storeId = pathnames[0]; // Ambil storeId dari URL
  const entity = pathnames[1]; // Ambil entitas dari URL

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(setPageTitle("Attributes Form")); // Set judul halaman
  });

  const navigate = useNavigate();
  const { id } = useParams(); // Ambil ID jika ada (untuk edit)

  // Ambil data attribute jika ID tersedia (edit)
  const { data } = useGetSingleAttributesQuery(
    { storeId, id },
    { skip: !id }
  ); // Menarik data jika ID ada

  // Mutation untuk update data
  const [updateAttributes, { isSuccess: isUpdateSuccess, error: errorUpdate }] =
    useUpdateAttributesMutation();
  // Mutation untuk simpan data baru
  const [storeAttributes, { data: dataStore, isSuccess: isSuccessStore, error: errorStore }] =
    useStoreAttributesMutation();

  /*****************************
   * State untuk input dinamis values
   */
  const [valuesArray, setValuesArray] = useState(
    data?.values || [{ value: "" }]
  );

  // Update valuesArray ketika data berubah (untuk form edit)
  useEffect(() => {
    setValuesArray(
        data?.values || [{ value: "" }]
    )
  },[data])

  /*****************************
   * Validasi form menggunakan Yup
   */
  const schema = Yup.object().shape({
    name: Yup.string().required("Name is required"),
  });

  /*****************************
   * Konfigurasi Formik
   */
  const formik = useFormik({
    enableReinitialize: true, // Reset form jika data berubah (saat edit)
    initialValues: {
      name: data?.name || "",
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      // Payload untuk update data
      if (id) {
        const payload = {
            name: values.name,
            values: valuesArray.filter((v: any) => v.value.trim() !== ""),
            _method: "PUT"
        };
        await updateAttributes({ storeId, id, data: payload });
      } else {
        // Payload untuk simpan data baru
        const payload = {
            name: values.name,
            values: valuesArray.filter((v: any) => v.value.trim() !== ""),
        };
        await storeAttributes({ storeId, data: payload });
      }
    },
  });

  // Ambil data dari formik
  const { errors, touched, values, handleChange, handleSubmit } = formik;

  /*****************************
   * Handler untuk menambah, menghapus, dan mengubah value
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
      {/* Header Form: Judul dan button simpan */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-5">
        <h2 className="text-xl">Attributes</h2>
        <button type="submit" className="btn btn-primary">
          Save
        </button>
      </div>

      {/* Input Nama Attribute */}
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
            {/* Tampilkan error jika validasi gagal */}
            {errors.name && touched.name && typeof errors.name === 'string' && (
              <span className="text-red-500 block mt-2">{errors.name}</span>
            )}
          </div>

          {/* Input Value Dinamis */}
          <div>
            <label htmlFor="name">Values<span className="text-danger">*</span></label>
            {valuesArray.map((item: any, index: number) => (
              <div key={index} className="flex items-center gap-4 mb-3">
                {/* Input untuk setiap value */}
                <input
                  type="text"
                  value={item.value}
                  onChange={(e) => handleChangeValue(index, e.target.value)}
                  placeholder="Enter Value"
                  className="form-input flex-1"
                />
                {/* button hapus value */}
                <div 
                    onClick={() => handleRemoveValue(index)}
                    className="cursor-pointer"
                >
                    <IconX/>
                </div>
              </div>
            ))}
            {/* button untuk menambahkan nilai baru */}
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
