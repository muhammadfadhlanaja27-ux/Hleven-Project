<?php

namespace Database\Seeders;

use App\Models\City;
use Illuminate\Database\Seeder;

class CitySeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            'Aceh' => ['Banda Aceh', 'Sabang', 'Lhokseumawe', 'Langsa', 'Subulussalam', 'Aceh Besar', 'Aceh Jaya'],
            'Sumatera Utara' => ['Medan', 'Binjai', 'Tebing Tinggi', 'Pematangsiantar', 'Tanjungbalai', 'Sibolga', 'Padangsidimpuan', 'Gunungsitoli', 'Deli Serdang', 'Karo'],
            'Sumatera Barat' => ['Padang', 'Solok', 'Sawahlunto', 'Padang Panjang', 'Bukittinggi', 'Payakumbuh', 'Pariaman', 'Agam', 'Pasaman'],
            'Riau' => ['Pekanbaru', 'Dumai', 'Siak', 'Bengkalis', 'Indragiri Hilir', 'Indragiri Hulu', 'Kampar', 'Pelalawan'],
            'Kepulauan Riau' => ['Tanjungpinang', 'Batam', 'Bintan', 'Karimun', 'Natuna', 'Anambas', 'Lingga'],
            'Jambi' => ['Jambi', 'Sungaipenuh', 'Muaro Jambi', 'Batanghari', 'Tanjung Jabung Barat', 'Tanjung Jabung Timur'],
            'Sumatera Selatan' => ['Palembang', 'Prabumulih', 'Pagar Alam', 'Lubuklinggau', 'Baturaja', 'Muara Enim', 'Lahat'],
            'Bangka Belitung' => ['Pangkalpinang', 'Bangka', 'Belitung', 'Bangka Barat', 'Bangka Tengah', 'Bangka Selatan', 'Belitung Timur'],
            'Bengkulu' => ['Bengkulu', 'Rejang Lebong', 'Lebong', 'Kepahiang', 'Muko Muko', 'Seluma', 'Kaur'],
            'Lampung' => ['Bandar Lampung', 'Metro', 'Lampung Selatan', 'Lampung Tengah', 'Lampung Utara', 'Pringsewu', 'Pesawaran'],
            'DKI Jakarta' => ['Jakarta Pusat', 'Jakarta Utara', 'Jakarta Barat', 'Jakarta Selatan', 'Jakarta Timur', 'Kepulauan Seribu'],
            'Jawa Barat' => ['Bandung', 'Bekasi', 'Depok', 'Bogor', 'Tasikmalaya', 'Cimahi', 'Sukabumi', 'Banjar', 'Cirebon', 'Sumedang', 'Garut', 'Cianjur', 'Karawang', 'Subang', 'Purwakarta', 'Indramayu', 'Majalengka', 'Kuningan'],
            'Banten' => ['Serang', 'Tangerang', 'Tangerang Selatan', 'Cilegon', 'Lebak', 'Pandeglang'],
            'Jawa Tengah' => ['Semarang', 'Surakarta', 'Magelang', 'Pekalongan', 'Salatiga', 'Tegal', 'Banyumas', 'Cilacap', 'Brebes', 'Kebumen', 'Klaten', 'Kudus', 'Pati', 'Jepara', 'Rembang', 'Wonogiri', 'Wonosobo', 'Boyolali', 'Grobogan', 'Sragen', 'Sukoharjo', 'Temanggung'],
            'DI Yogyakarta' => ['Yogyakarta', 'Sleman', 'Bantul', 'Kulon Progo', 'Gunungkidul'],
            'Jawa Timur' => ['Surabaya', 'Malang', 'Batu', 'Kediri', 'Blitar', 'Madiun', 'Pasuruan', 'Probolinggo', 'Mojokerto', 'Sidoarjo', 'Gresik', 'Lamongan', 'Tuban', 'Bojonegoro', 'Jember', 'Banyuwangi', 'Situbondo', 'Bondowoso', 'Lumajang', 'Probolinggo', 'Sumenep', 'Pamekasan', 'Sampang', 'Bangkalan'],
            'Bali' => ['Denpasar', 'Badung', 'Gianyar', 'Tabanan', 'Buleleng', 'Klungkung', 'Bangli', 'Karangasem', 'Jembrana'],
            'Nusa Tenggara Barat' => ['Mataram', 'Bima', 'Lombok Barat', 'Lombok Tengah', 'Lombok Timur', 'Sumbawa', 'Dompu'],
            'Nusa Tenggara Timur' => ['Kupang', 'Sikka', 'Ende', 'Flores Timur', 'Manggarai', 'Alor', 'Belu', 'Sumba Timur', 'Sumba Barat'],
            'Kalimantan Barat' => ['Pontianak', 'Singkawang', 'Kubu Raya', 'Mempawah', 'Sambas', 'Sintang', 'Ketapang'],
            'Kalimantan Tengah' => ['Palangkaraya', 'Kotawaringin Barat', 'Kotawaringin Timur', 'Kapuas', 'Barito Selatan', 'Barito Utara'],
            'Kalimantan Selatan' => ['Banjarmasin', 'Banjarbaru', 'Banjar', 'Barito Kuala', 'Tanah Laut', 'Tanah Bumbu', 'Kotabaru'],
            'Kalimantan Timur' => ['Samarinda', 'Balikpapan', 'Bontang', 'Kutai Kartanegara', 'Kutai Timur', 'Kutai Barat', 'Berau', 'Penajam Paser Utara'],
            'Kalimantan Utara' => ['Tanjung Selor', 'Tarakan', 'Nunukan', 'Malinau', 'Bulungan', 'Tana Tidung'],
            'Sulawesi Utara' => ['Manado', 'Bitung', 'Tomohon', 'Kotamobagu', 'Minahasa', 'Minahasa Utara', 'Minahasa Selatan', 'Bolaang Mongondow'],
            'Gorontalo' => ['Gorontalo', 'Boalemo', 'Bone Bolango', 'Pohuwato', 'Gorontalo Utara'],
            'Sulawesi Tengah' => ['Palu', 'Donggala', 'Parigi Moutong', 'Poso', 'Toli-Toli', 'Banggai', 'Morowali'],
            'Sulawesi Barat' => ['Mamuju', 'Majene', 'Polewali Mandar', 'Mamasa', 'Pasangkayu'],
            'Sulawesi Selatan' => ['Makassar', 'Parepare', 'Palopo', 'Gowa', 'Maros', 'Bone', 'Bulukumba', 'Toraja', 'Luwu'],
            'Sulawesi Tenggara' => ['Kendari', 'Baubau', 'Buton', 'Muna', 'Kolaka', 'Wakatobi', 'Bombana'],
            'Maluku' => ['Ambon', 'Tual', 'Maluku Tengah', 'Maluku Tenggara', 'Buru', 'Seram Bagian Barat', 'Seram Bagian Timur'],
            'Maluku Utara' => ['Ternate', 'Tidore Kepulauan', 'Halmahera Barat', 'Halmahera Tengah', 'Halmahera Utara', 'Halmahera Selatan', 'Halmahera Timur'],
            'Papua Barat' => ['Manokwari', 'Fakfak', 'Kaimana', 'Teluk Bintuni', 'Teluk Wondama'],
            'Papua' => ['Jayapura', 'Sentani', 'Biak Numfor', 'Kepulauan Yapen', 'Mamberamo Raya', 'Sarmi', 'Waropen'],
            'Papua Selatan' => ['Merauke', 'Asmat', 'Mappi', 'Boven Digoel'],
            'Papua Tengah' => ['Nabire', 'Paniai', 'Mimika', 'Puncak Jaya', 'Dogiyai', 'Deiyai', 'Intan Jaya'],
            'Papua Pegunungan' => ['Wamena', 'Jayawijaya', 'Lanny Jaya', 'Nduga', 'Tolikara', 'Yahukimo', 'Yalimo'],
            'Papua Barat Daya' => ['Sorong', 'Raja Ampat', 'Tambrauw', 'Maybrat', 'Sorong Selatan'],
        ];

        foreach ($data as $province => $cities) {
            foreach ($cities as $city) {
                City::updateOrCreate(
                    ['province' => $province, 'city' => $city],
                    ['province' => $province, 'city' => $city]
                );
            }
        }
    }
}
