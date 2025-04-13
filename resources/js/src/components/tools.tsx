import Swal from "sweetalert2";

/**
 * Menampilkan konfirmasi delete dengan SweetAlert
 * @param selectedRecords - Data yang dipilih untuk dihapus
 * @param deleteCategory - Fungsi untuk menghapus data
 * @param storeId - ID Store terkait
 * @param refetch - Fungsi untuk refresh data setelah delete
 */
export const deleteConfirmation = async (
    selectedRecords: any[],
    deleteCategory: (params: { storeId: string; id: string }) => any,
    refetch: () => void,
    storeId?: string,
) => {
    if (!selectedRecords.length) {
        Swal.fire({
            icon: "info",
            title: "No Selection",
            text: "Please select at least one record to delete.",
            // customClass: "sweet-alerts",
            customClass: {
                popup: "sweet-alerts", 
                confirmButton: "btn-confirm", 
                cancelButton: "btn-cancel", 
            },
        });
        return;
    }

    const result = await Swal.fire({
        icon: "warning",
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        showCancelButton: true,
        confirmButtonText: "Delete",
        cancelButtonText: "Cancel",
        padding: "2em",
        // customClass: "sweet-alerts",
        customClass: {
            popup: "sweet-alerts", 
            confirmButton: "btn-confirm", 
            cancelButton: "btn-cancel", 
        },
    });

    if (result.isConfirmed) {
        try {
            // Iterasi dan hapus setiap item
            // const deletePromises = selectedRecords.map((record) =>
            //     deleteCategory({ storeId, id: record.id }).unwrap()
            // );

            const deletePromises = selectedRecords.map((record: any) => {
                const params = storeId ? { storeId, id: record.id } : record.id;
                // console.log(params)
                return deleteCategory(params);
            });

            // Tunggu semua penghapusan selesai
            await Promise.all(deletePromises);

            // Tampilkan notifikasi sukses
            Swal.fire({
                title: "Deleted!",
                text: "Selected records have been deleted.",
                icon: "success",
                // customClass: "sweet-alerts",
                customClass: {
                    popup: "sweet-alerts", 
                    confirmButton: "btn-confirm", 
                    cancelButton: "btn-cancel", 
                },
            });

            // Refresh data setelah delete
            refetch();
        } catch (error) {
            console.error("Error deleting users:", error);
            Swal.fire({
                title: "Error!",
                text: "An error occurred while deleting records.",
                icon: "error",
                // customClass: "sweet-alerts",
                customClass: {
                    popup: "sweet-alerts", 
                    confirmButton: "btn-confirm", 
                    cancelButton: "btn-cancel", 
                },
            });
        }
    }
};


export function capitalizeFirstLetter(str: string): string {
    // return str.charAt(0).toUpperCase() + str.slice(1);
    return str
        .split('-') // Pisahkan kata berdasarkan tanda '-'
        .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Kapitalisasi huruf pertama tiap kata
        .join(' '); // Gabungkan kembali dengan spasi
}

export const generateSlug = (text:any) => {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '') // Hapus karakter non-alphanumeric
        .replace(/\s+/g, '-')        // Ganti spasi dengan tanda hubung
        .replace(/-+/g, '-');        // Ganti tanda hubung berulang dengan satu tanda hubung
};

export const formatRupiah = (number: number): string => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0, // Menghilangkan desimal
    }).format(number);
};

export const formatNumber = (num: any) => {
    return num?.toLocaleString(); // Format angka dengan titik setiap 3 digit
};
