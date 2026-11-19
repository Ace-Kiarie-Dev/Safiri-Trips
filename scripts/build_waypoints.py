"""Builds assets/stories/waypoints.json: short roadside stops along Kenya's main corridors.
Coordinates are approximate (good enough for a pin and a corridor match). Facts are
well known but should be checked like the stories (see docs/STORIES_FACT_CHECK.md)."""
import json, re

# (name, corridor, kind, lat, lng, blurb, tip)
# kinds: viewpoint, nature, culture, food, wildlife, heritage, town
W = [
 # Nairobi to Mombasa (A109)
 ("Athi River", "nairobi-mombasa", "town", -1.4560, 36.9780, "Last big town before the plains. Fuel, supermarkets and the start of the open road.", "Fill the tank here, the next big stop is a long way."),
 ("Lukenya Hill", "nairobi-mombasa", "nature", -1.4700, 37.0700, "A rocky hill popular with climbers and hikers, just off the highway after Athi River.", "A short scramble gives a wide view back towards Nairobi."),
 ("Machakos Town", "nairobi-mombasa", "town", -1.5177, 37.2634, "One of Kenya's oldest towns, a short detour off the highway with hills all around.", "Try the roadside roast maize and the mango sellers in season."),
 ("Emali", "nairobi-mombasa", "town", -2.0960, 37.4680, "The junction town where the road to Amboseli leaves the Mombasa highway.", "Good place for a snack and a stretch before the Amboseli turn."),
 ("Hunter's Lodge, Kiboko", "nairobi-mombasa", "food", -2.2100, 37.7200, "A classic old stopover beside a spring-fed pool full of birds, halfway to the coast.", "Lunch under the trees, watch the weavers and kingfishers."),
 ("Makindu Sikh Temple", "nairobi-mombasa", "culture", -2.2830, 37.8230, "A gurdwara that has welcomed travellers of every faith for a century, with free meals and a quiet garden.", "Cover your head, remove shoes, and leave a donation if you eat."),
 ("Kibwezi Forest", "nairobi-mombasa", "nature", -2.3900, 37.9500, "A pocket of indigenous forest with springs, butterflies and birds, a green surprise in dry country.", "The forest is looked after with the Sheldrick Trust and the lodge inside is for foster parents, so check access before you turn off."),
 ("Mtito Andei", "nairobi-mombasa", "town", -2.6900, 38.1700, "The halfway town between Nairobi and Mombasa, and the gate town for Tsavo.", "Last reliable fuel and food before the long Tsavo stretch."),
 ("Tsavo River Bridge", "nairobi-mombasa", "viewpoint", -2.9800, 38.4700, "Where the highway crosses the Tsavo River, with the park on both sides and often elephants near the water.", "Slow down and look, but do not stop on the bridge itself."),
 ("Voi", "nairobi-mombasa", "town", -3.3960, 38.5560, "The town between Tsavo East and the Taita Hills, with lodges and the park's main gate close by.", "Turn off here for Tsavo East or the Taita Hills."),
 ("Taita Hills", "nairobi-mombasa", "nature", -3.4000, 38.3500, "Cool forested hills rising above the dry Tsavo plains, with cloud forest and rare birds.", "A long detour, but a cool night's sleep after the heat."),
 ("Mackinnon Road Mosque", "nairobi-mombasa", "culture", -3.7360, 39.0420, "A small mosque beside the highway that marks the grave of a railway-era Muslim saint, a place of pilgrimage.", "Visitors are welcome, dress modestly and ask before photos."),
 ("Mariakani", "nairobi-mombasa", "town", -3.8640, 39.4740, "The last town before Mombasa, where the coast heat and the coconut palms begin.", "Buy madafu, young coconut water, from the roadside."),
 # Nairobi to Naivasha and Nakuru (A104)
 ("Rift Valley Viewpoint", "nairobi-nakuru", "viewpoint", -1.0870, 36.6150, "The escarpment edge where the floor of the Great Rift Valley suddenly opens below you, with Longonot in the distance.", "Stop at the curio stalls early, before the tour buses."),
 ("Mai Mahiu Catholic Church", "nairobi-nakuru", "heritage", -1.0030, 36.5890, "A tiny chapel built by Italian prisoners of war in the 1940s while they built the escarpment road.", "A five minute stop, right beside the road at the bottom of the hill."),
 ("Mount Longonot", "nairobi-nakuru", "nature", -0.9144, 36.4467, "The volcano with a bite out of its top, a steep half day hike to the crater rim.", "Start early, there is no shade on the climb."),
 ("Hell's Gate", "nairobi-nakuru", "nature", -0.9160, 36.3130, "Cycle among zebra and giraffe between red cliffs, a short detour south of Naivasha.", "Hire bikes at the gate, go early."),
 ("Lake Naivasha", "nairobi-nakuru", "nature", -0.7700, 36.3500, "The freshwater lake with hippos, pelicans and fish eagles, two hours from Nairobi.", "A boat ride at sunrise is the best hour on the lake."),
 ("Lake Elmenteita Viewpoint", "nairobi-nakuru", "viewpoint", -0.4400, 36.2400, "A highway lay-by looking down on the soda lake and the Sleeping Warrior hills.", "Pelicans and flamingos are often visible from the road."),
 ("Kariandusi Prehistoric Site", "nairobi-nakuru", "heritage", -0.4480, 36.2700, "Stone tools lying where early humans left them, with a small museum, just off the highway.", "Combine it with the Elmenteita viewpoint next door."),
 ("Lake Nakuru National Park", "nairobi-nakuru", "wildlife", -0.3667, 36.0833, "The compact park around a soda lake, the easiest place to see rhino in Kenya.", "Main gate is minutes from Nakuru town."),
 ("Menengai Crater", "nairobi-nakuru", "viewpoint", -0.2000, 36.0700, "A giant caldera on the edge of Nakuru, drive to the rim in minutes.", "Windy and wide, bring a jacket."),
 # Nairobi to Namanga and Amboseli (A104 south)
 ("Ngong Hills", "nairobi-amboseli", "nature", -1.4018, 36.6390, "The ridge walk on the edge of the Rift, with Nairobi on one side and the valley on the other.", "Hire a ranger at the gate for the full ridge."),
 ("Kajiado", "nairobi-amboseli", "town", -1.8520, 36.7770, "The Maasai county town, with a busy livestock market and beadwork on sale.", "Market days are the liveliest, ask locally which day."),
 ("Namanga", "nairobi-amboseli", "town", -2.5450, 36.7900, "The border town with Tanzania, in the shadow of Namanga Hill, with Maasai craft markets by the road.", "Bargain gently and in good humour."),
 ("Kimana", "nairobi-amboseli", "wildlife", -2.7640, 37.5200, "The gateway town to Amboseli's eastern side, with a community wildlife sanctuary and the first clear views of Kilimanjaro.", "Fuel up here, there is none in the park."),
 ("Kilimanjaro Viewpoint, Kimana road", "nairobi-amboseli", "viewpoint", -2.7200, 37.4000, "On the approach to Kimana the land opens up and Kilimanjaro fills the sky on a clear morning.", "Pull well off the road for photos, the mountain is clearest before 9am."),
 ("Chyulu Hills", "nairobi-amboseli", "nature", -2.6800, 37.8800, "Young green volcanic hills with lava tubes and huge views, a proper detour between Emali and Tsavo West.", "Rough roads, go in a 4x4."),
 # Nairobi to Nanyuki and Mount Kenya (A2)
 ("Thika", "nairobi-nanyuki", "town", -1.0330, 37.0690, "The pineapple town, with the Chania and Thika falls right beside the old road.", "Stop at the falls behind the old Blue Posts hotel."),
 ("Fourteen Falls", "nairobi-nanyuki", "nature", -1.0720, 37.2130, "A wide set of waterfalls on the Athi River near Thika, best after the rains.", "Go with a local guide, and keep away from the edge."),
 ("Ol Donyo Sabuk", "nairobi-nanyuki", "nature", -1.1320, 37.2550, "A lone forested mountain east of Thika with buffalo, a summit road and views of both Mount Kenya and Kilimanjaro.", "A small KWS park, drive or hike to the top."),
 ("Mwea Rice Fields", "nairobi-nanyuki", "viewpoint", -0.7000, 37.3500, "Flat green paddies stretching to the horizon, Kenya's rice bowl, beside the road through Mwea.", "Buy a bag of pishori rice from the roadside stalls."),
 ("Sagana", "nairobi-nanyuki", "nature", -0.6700, 37.2100, "The white water rafting stretch of the Tana River, with camps on the bank.", "Book a rafting trip ahead, mornings are calmer."),
 ("Nanyuki Equator Line", "nairobi-nanyuki", "heritage", 0.0000, 37.0670, "The sign where the road crosses the equator, with the water-draining demonstration everyone falls for.", "Stand with a foot in each hemisphere for the photo."),
 ("Ol Pejeta Conservancy", "nairobi-nanyuki", "wildlife", 0.0043, 36.9637, "The conservancy with the last two northern white rhinos, minutes from Nanyuki.", "Book the rhino visit ahead."),
 ("Trout Tree, Nanyuki", "nairobi-nanyuki", "food", -0.0400, 37.0400, "A restaurant built up in a fig tree over trout ponds, a favourite lunch stop on the Mount Kenya road.", "Colobus monkeys in the branches, keep an eye on your bread."),
 # Nairobi to Kisumu (A104 / B1)
 ("Kinangop Plateau", "nairobi-kisumu", "viewpoint", -0.6300, 36.5500, "High, cold farmland under the Aberdares on the old road to Nakuru, with wide skies and potato fields.", "Carry a jacket, it is cold up here."),
 ("Kericho Tea Fields", "nairobi-kisumu", "viewpoint", -0.3670, 35.2830, "Rolling green tea as far as you can see, with pickers in the rows and afternoon rain most days.", "Stop at a tea estate gate for a tasting."),
 ("Kisumu Lakeside", "nairobi-kisumu", "food", -0.1000, 34.7400, "Lake Victoria's waterfront, where the fish is fried fresh and the sunsets are long.", "Order tilapia and ugali at Dunga Beach."),
 ("Kit Mikayi", "nairobi-kisumu", "heritage", -0.1170, 34.5400, "The balanced boulders sacred to the Luo, west of Kisumu.", "Take a local guide into the rocks."),
 ("Kakamega Forest", "nairobi-kisumu", "nature", 0.2900, 34.8600, "Kenya's only tropical rainforest, with monkeys, butterflies and dawn walks.", "Hire a community guide."),
 # Mombasa to Malindi and Diani (coast road)
 ("Nyali Bridge Viewpoint", "coast", "viewpoint", -4.0470, 39.6870, "The crossing from Mombasa island to the north coast, with the creek and the dhows below.", "Best at sunset from the north bank."),
 ("Mtwapa Creek", "coast", "food", -3.9500, 39.7400, "A tidal creek lined with seafood restaurants and boat moorings on the way north.", "Try the prawns at a creekside table."),
 ("Kilifi Creek", "coast", "viewpoint", -3.6300, 39.8500, "A deep blue creek crossed by a long bridge, with sailing boats and a laid-back town on the north bank.", "Stop on the Kilifi side for a swim at the creek beach."),
 ("Gedi Ruins", "coast", "heritage", -3.3094, 40.0172, "The Swahili stone town swallowed by forest, just off the Malindi road.", "Take a guide at the gate."),
 ("Mida Creek Boardwalk", "coast", "nature", -3.3620, 39.9700, "A long boardwalk through mangroves to a sunset platform, run by the local community.", "Low tide for wading birds, sunset for the light."),
 ("Likoni Ferry", "coast", "culture", -4.0700, 39.6600, "The famous ferry across Kilindini harbour, the only way south from Mombasa island by road.", "Walk on if you can, the car queues are long at rush hour."),
 ("Shimba Hills", "coast", "wildlife", -4.2570, 39.3880, "Cool forest hills above the south coast, with sable antelope and Sheldrick Falls.", "A half day detour from Diani."),
 ("Shimoni", "coast", "culture", -4.6470, 39.3800, "The end of the south coast road, with the slave caves and the boats to Wasini and the marine park.", "Boats leave early for the best snorkelling."),
]

out = []
for name, corridor, kind, lat, lng, blurb, tip in W:
    slug = re.sub(r"[^a-z0-9]+", "-", name.lower().replace("'", "")).strip("-")
    out.append({"id": f"wp-{slug}", "slug": f"wp-{slug}", "name": name, "corridor": corridor, "kind": kind,
                "lat": lat, "lng": lng, "blurb": blurb, "tip": tip})
json.dump(out, open("assets/stories/waypoints.json", "w"), indent=2, ensure_ascii=False)
print(len(out), "waypoints")
