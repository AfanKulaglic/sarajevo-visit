import type { LangCode } from "./i18n";
import { db } from "./firebase";
import { ref, set, onValue } from "firebase/database";

// ── Firebase-backed override type ─────────────────────────────────────────────
// Stored at /locationTranslations/{locId}/{langCode} → { name, description, story }
export type LocTranslationOverrides = Partial<
  Record<string, Partial<Record<LangCode, LocationContent>>>
>;

export interface LocationContent {
  name: string;
  description: string;
  story: string;
}

type LocationTranslations = Record<string, Partial<Record<LangCode, LocationContent>>>;

// ── Per-location translations (English falls through to locations.ts defaults) ─

export const locationTranslations: LocationTranslations = {

  // ── 1 · Sebilj ──────────────────────────────────────────────────────────────
  "1": {
    bs: {
      name: "Sebilj",
      description: "Ikonična osmanska fontana u srcu Baščaršije",
      story:
        "Sebilj je kucajuće srce Sarajeva. Ovaj raskošni osmanski drveni šadrvan, okrunjen kupolastim krovom i okružen golubovima, stoji u centru Baščaršije od 1891. godine — vjerna kopija originala koji je 1753. godine izgradio Mehmed-beg Myftić. Lokalna legenda kaže da će svako ko pije njenu vodu uvijek se vratiti u Sarajevo. Simbol osmanskog naslijeđa i trajnog duha grada, Sebilj ostaje najfotografisanija znamenitost Bosne.",
    },
    tr: {
      name: "Sebilj",
      description: "Baščaršija'nın kalbindeki ikonik Osmanlı çeşmesi",
      story:
        "Sebilj, Saraybosna'nın çarpan kalbidir. Kubbe çatısıyla taçlandırılmış ve güvercinlerle çevrili bu görkemli Osmanlı ahşap çeşmesi, 1891'den beri Baščaršija'nın merkezinde durmaktadır; bu çeşme, 1753 yılında Mehmed Bey Myftić tarafından inşa edilen orijinalin sadık bir kopyasıdır. Yerel efsaneye göre suyundan içen herkes Saraybosna'ya geri dönecektir. Osmanlı mirasının ve şehrin kalıcı ruhunun sembolü olan Sebilj, Bosna'nın en çok fotoğraflanan tarihi yeri olmaya devam etmektedir.",
    },
    ar: {
      name: "سبيل",
      description: "النافورة العثمانية الأيقونية في قلب باشتشارشيا",
      story:
        "سبيل هو القلب النابض لسراييفو. هذه النافورة الخشبية العثمانية الزخرفية المتوجة بسقف مقبب والمحاطة بالحمام تقف في وسط باشتشارشيا منذ عام 1891، وهي نسخة وفية من الأصل الذي بناه محمد بيك مفتيتش عام 1753. تقول الأسطورة المحلية إن من يشرب من مياهها سيعود دائماً إلى سراييفو. رمز التراث العثماني وروح المدينة الدائمة، يظل السبيل أكثر المعالم تصويراً في البوسنة.",
    },
    de: {
      name: "Sebilj",
      description: "Der ikonische osmanische Brunnen im Herzen der Baščaršija",
      story:
        "Der Sebilj ist das schlagende Herz Sarajevos. Dieser prächtige osmanische Holzbrunnen, gekrönt von einem Kuppeldach und umgeben von Tauben, steht seit 1891 im Zentrum der Baščaršija — ein treues Abbild des Originals, das 1753 von Mehmed-Beg Myftić erbaut wurde. Der lokalen Legende nach wird jeder, der von seinen Wassern trinkt, immer nach Sarajevo zurückkehren. Als Symbol des osmanischen Erbes und des unvergänglichen Geistes der Stadt bleibt der Sebilj das meistfotografierte Wahrzeichen Bosniens.",
    },
    sl: {
      name: "Sebilj",
      description: "Ikonična osmanska fontana v srcu Baščaršije",
      story:
        "Sebilj je utripajoče srce Sarajeva. Ta okrašena osmanska lesena fontana, okronana s kupolasto streho in obdana z golobi, stoji v središču Baščaršije od leta 1891 — zvesta kopija originala, ki ga je leta 1753 zgradil Mehmed-beg Myftić. Lokalna legenda pravi, da se kdor pije njeno vodo, vedno vrne v Sarajevo. Simbol osmanskega dediščine in trajnega duha mesta, Sebilj ostaja najbolj fotografirana znamenitost Bosne.",
    },
    it: {
      name: "Sebilj",
      description: "L'iconica fontana ottomana nel cuore della Baščaršija",
      story:
        "Il Sebilj è il cuore pulsante di Sarajevo. Questa ornata fontana ottomana in legno, coronata da un tetto a cupola e circondata da piccioni, si trova nel centro della Baščaršija dal 1891 — fedele replica dell'originale costruito nel 1753 da Mehmed-Beg Myftić. La leggenda locale vuole che chiunque beva dalle sue acque torni sempre a Sarajevo. Simbolo del patrimonio ottomano e dello spirito immortale della città, il Sebilj rimane il monumento più fotografato della Bosnia.",
    },
    fr: {
      name: "Sebilj",
      description: "La fontaine ottomane iconique au cœur de la Baščaršija",
      story:
        "Le Sebilj est le cœur battant de Sarajevo. Cette ornée fontaine ottomane en bois, couronnée d'un toit en dôme et entourée de pigeons, se dresse au centre de la Baščaršija depuis 1891 — réplique fidèle de l'original construit en 1753 par Mehmed-Beg Myftić. La légende locale veut que quiconque boit de ses eaux revienne toujours à Sarajevo. Symbole du patrimoine ottoman et de l'esprit éternel de la ville, le Sebilj reste le monument le plus photographié de Bosnie.",
    },
    es: {
      name: "Sebilj",
      description: "La icónica fuente otomana en el corazón de Baščaršija",
      story:
        "El Sebilj es el corazón latiente de Sarajevo. Esta ornamentada fuente otomana de madera, coronada con una cúpula y rodeada de palomas, se ha alzado en el centro de Baščaršija desde 1891 — fiel réplica del original construido en 1753 por Mehmed-Beg Myftić. La leyenda local dice que quien beba de sus aguas siempre regresará a Sarajevo. Símbolo del patrimonio otomano y del espíritu imperecedero de la ciudad, el Sebilj sigue siendo el monumento más fotografiado de Bosnia.",
    },
  },

  // ── 2 · Vijećnica ────────────────────────────────────────────────────────────
  "2": {
    bs: {
      name: "Vijećnica",
      description: "Veličanstvena austrougarska gradska vijećnica",
      story:
        "Izgrađena 1896. godine za vrijeme austrougarske uprave, Vijećnica je dizajnirana od strane češkog arhitekta Karela Paříka u upečatljivom pseudo-maurskom stilu. Njena šarena fasada i veličanstveni enterijer učinili su je jednom od najljepših zgrada na Balkanu. U noći između 25. i 26. avgusta 1992. godine, srpske snage su namjerno granatovale i zapalile zgradu tokom opsade Sarajeva, uništavajući više od 1,5 miliona neprocjenjivih knjiga, rukopisa i historijskih dokumenata. Nakon dva desetljeća brižljive obnove, Vijećnica je ponovo otvorena 9. juna 2014. godine — trijumf otpornosti i kulturnog pamćenja.",
    },
    tr: {
      name: "Vijećnica",
      description: "Muhteşem Avusturya-Macaristan Belediye Binası",
      story:
        "1896 yılında Avusturya-Macar yönetimi altında inşa edilen Vijećnica, Çek mimar Karel Pařík tarafından çarpıcı pseudo-Mağribi tarzında tasarlanmıştır. Renkli cephesi ve görkemli iç mekanı onu Balkanların en güzel binalarından biri haline getirdi. 25-26 Ağustos 1992 gecesi, Saraybosna kuşatması sırasında Sırp kuvvetleri binayı kasıtlı olarak bombalayıp yaktı ve 1,5 milyondan fazla paha biçilmez kitap, el yazması ve tarihi belgeyi yok etti. İki on yıllık titiz restorasyon çalışmalarının ardından Vijećnica, 9 Haziran 2014'te yeniden açıldı — direniş ve kültürel hafızanın zaferi.",
    },
    ar: {
      name: "فيتشنيتسا",
      description: "قاعة المدينة النمساوية المجرية الرائعة",
      story:
        "بُنيت عام 1896 في عهد الإدارة النمساوية المجرية، وصممها المعماري التشيكي كاريل باريك بأسلوب مغاربي زائف رائع. جعلت واجهتها الملونة وداخلها الفخم منها واحدة من أجمل المباني في البلقان. في ليلة 25-26 أغسطس 1992، قصفت القوات الصربية المبنى وأحرقته عمداً خلال حصار سراييفو، مما أدى إلى تدمير أكثر من مليون ونصف كتاب ومخطوطة ووثيقة تاريخية لا تقدر بثمن. بعد عقدين من الترميم الدقيق، أعيد افتتاح فيتشنيتسا في 9 يونيو 2014 — انتصار للصمود والذاكرة الثقافية.",
    },
    de: {
      name: "Vijećnica",
      description: "Das prächtige österreichisch-ungarische Rathaus",
      story:
        "Das 1896 unter österreichisch-ungarischer Verwaltung erbaute Vijećnica wurde vom tschechischen Architekten Karel Pařík im auffälligen pseudo-maurischen Stil entworfen. Seine farbenfrohe Fassade und das prachtvolle Innere machten es zu einem der schönsten Gebäude auf dem Balkan. In der Nacht vom 25. auf den 26. August 1992 bombardierten und verbrannten serbische Streitkräfte das Gebäude während der Belagerung Sarajevos absichtlich und zerstörten dabei über 1,5 Millionen unersetzliche Bücher, Manuskripte und historische Dokumente. Nach zwei Jahrzehnten aufwändiger Restaurierung wurde das Vijećnica am 9. Juni 2014 wiedereröffnet — ein Triumph der Widerstandskraft und des kulturellen Gedächtnisses.",
    },
    sl: {
      name: "Vijećnica",
      description: "Veličastna avstro-ogrska mestna hiša",
      story:
        "Zgrajena leta 1896 pod avstro-ogrsko upravo, Vijećnica je bila zasnovana od češkega arhitekta Karela Paříka v udarnem pseudo-mavretanskem slogu. Njena barvita fasada in veličastna notranjost sta jo naredili eno najlepših zgradb na Balkanu. V noči med 25. in 26. avgustom 1992 so srbske sile namerno obstreljevale in zažgale zgradbo med obleganjem Sarajeva ter uničile več kot 1,5 milijona neprecenljivih knjig, rokopisov in zgodovinskih dokumentov. Po dveh desetletjih skrbne obnove je Vijećnica znova odprla vrata 9. junija 2014 — triumf odpornosti in kulturnega spomina.",
    },
    it: {
      name: "Vijećnica",
      description: "Il magnifico Municipio austroungarico",
      story:
        "Costruita nel 1896 sotto l'amministrazione austro-ungarica, la Vijećnica fu progettata dall'architetto ceco Karel Pařík in un suggestivo stile pseudo-moresco. La sua facciata colorata e il grandioso interno la resero uno degli edifici più belli dei Balcani. Nella notte tra il 25 e il 26 agosto 1992, le forze serbe bombardarono e bruciarono deliberatamente l'edificio durante l'assedio di Sarajevo, distruggendo oltre 1,5 milioni di libri, manoscritti e documenti storici insostituibili. Dopo due decenni di meticoloso restauro, la Vijećnica riaprì il 9 giugno 2014 — un trionfo di resilienza e memoria culturale.",
    },
    fr: {
      name: "Vijećnica",
      description: "Le magnifique hôtel de ville austro-hongrois",
      story:
        "Construite en 1896 sous l'administration austro-hongroise, la Vijećnica fut conçue par l'architecte tchèque Karel Pařík dans un frappant style pseudo-mauresque. Sa façade colorée et son intérieur grandiose en firent l'un des plus beaux bâtiments des Balkans. Dans la nuit du 25 au 26 août 1992, des forces serbes bombardèrent et incendièrent délibérément le bâtiment pendant le siège de Sarajevo, détruisant plus de 1,5 million de livres, manuscrits et documents historiques irremplaçables. Après deux décennies de restauration minutieuse, la Vijećnica rouvrit le 9 juin 2014 — un triomphe de la résilience et de la mémoire culturelle.",
    },
    es: {
      name: "Vijećnica",
      description: "El magnífico Ayuntamiento austrohúngaro",
      story:
        "Construida en 1896 bajo la administración austrohúngara, la Vijećnica fue diseñada por el arquitecto checo Karel Pařík en un llamativo estilo pseudomooresco. Su colorida fachada y su grandioso interior la convirtieron en uno de los edificios más hermosos de los Balcanes. En la noche del 25 al 26 de agosto de 1992, las fuerzas serbias bombardearon y quemaron deliberadamente el edificio durante el asedio de Sarajevo, destruyendo más de 1,5 millones de libros, manuscritos y documentos históricos irremplazables. Tras dos décadas de meticulosa restauración, la Vijećnica volvió a abrir el 9 de junio de 2014 — un triunfo de la resiliencia y la memoria cultural.",
    },
  },

  // ── 6 · Sahat Kula ───────────────────────────────────────────────────────────
  "6": {
    bs: {
      name: "Sahat-kula",
      description: "Toranj sata iz 17. vijeka koji i dalje radi po osmanskom lunarnom vremenu",
      story:
        "Sahat-kula stoji 25 metara visoko u blizini džamije Gazi Husrev-bega, izgrađena početkom 17. vijeka kao dio velikog osmanskog kompleksa koji je definisao Baščaršiju. Ono što je čini za razliku od svakog drugog sata na svijetu jest način na koji mjeri vrijeme: ne po suncu, već po Mjesecu. Radi po alaturka vremenu, sistemu gdje svaki novi dan počinje pri zalasku sunca, pa sat mora biti ručno ponovo namješten svake večeri kako se dužina noći mijenja s godišnjim dobima. Vijekovima se posvećeni čuvar vremena — sahatćija — penjao na toranj svake večeri da bi obavio ovaj obred. Danas je Sahat-kula jedan od posljednjih funkcionalnih satova koji mjere lunarno vrijeme na zemlji, živi relikt osmanskog svijeta koji je sate mjerio drugačije.",
    },
    tr: {
      name: "Saat Kulesi",
      description: "Hâlâ Osmanlı ay takvimiyle çalışan 17. yüzyıl saat kulesi",
      story:
        "Saat Kulesi, Gazi Hüsrev Bey Camii yakınında 25 metre yüksekliğinde durmaktadır; Baščaršija'yı tanımlayan büyük Osmanlı kompleksinin bir parçası olarak 17. yüzyılın başında inşa edilmiştir. Onu dünyadaki diğer saatlerden farklı kılan şey zamanı nasıl söylediğidir: güneşe göre değil, aya göre. Alaturka zamanına göre çalışır; her yeni gün gün batımında başlar, bu nedenle gece uzunluğu mevsimlerle değiştikçe saat her akşam manuel olarak sıfırlanmalıdır. Yüzyıllar boyunca özel bir zaman bekçisi — sahatćija — bu ritüeli gerçekleştirmek için her alacakaranlıkta kuleye tırmandı. Bugün Saat Kulesi, yeryüzündeki son çalışan ay zamanı saatlerinden biri; zamanı farklı ölçen bir Osmanlı dünyasının yaşayan kalıntısıdır.",
    },
    ar: {
      name: "برج الساعة",
      description: "برج ساعة من القرن السابع عشر لا يزال يعمل بالتوقيت القمري العثماني",
      story:
        "يقف برج الساعة بارتفاع 25 متراً بالقرب من جامع غازي خسرو بيك، بُني في مطلع القرن السابع عشر كجزء من المجمع العثماني الكبير الذي أعطى الطابع لباشتشارشيا. ما يميزه عن كل ساعة أخرى في العالم هو طريقة قياسه للوقت: ليس بحسب الشمس بل بحسب القمر. يعمل بالتوقيت العلى الترك، وهو نظام يبدأ فيه كل يوم جديد عند غروب الشمس، لذا يجب إعادة ضبط الساعة يدوياً كل مساء كما يتغير طول الليل مع الفصول. لقرون كان حارس الوقت المخصص — الساهاتتشيا — يصعد البرج كل غسق لأداء هذه الطقوس. اليوم يُعد برج الساعة أحد آخر الساعات القمرية الوظيفية على الأرض، وأثراً حياً لعالم عثماني قاس الساعات بطريقة مختلفة.",
    },
    de: {
      name: "Uhrturm",
      description: "Ein Uhrenturm aus dem 17. Jahrhundert, der noch immer nach osmanischer Mondzeit läuft",
      story:
        "Der Uhrturm — Sahat Kula — steht 25 Meter hoch in der Nähe der Gazi-Husrev-Beg-Moschee und wurde Anfang des 17. Jahrhunderts als Teil des großen osmanischen Komplexes errichtet, der die Baščaršija prägte. Was ihn von jeder anderen Uhr der Welt unterscheidet, ist die Art, wie er die Zeit anzeigt: nicht nach der Sonne, sondern nach dem Mond. Er läuft nach Alaturka-Zeit, einem System, bei dem jeder neue Tag bei Sonnenuntergang beginnt, sodass die Uhr jeden Abend manuell zurückgestellt werden muss, während sich die Länge der Nacht mit den Jahreszeiten ändert. Jahrhundertelang kletterte ein eigens dafür zuständiger Zeitmesser — der Sahatćija — jeden Abend den Turm hoch, um dieses Ritual durchzuführen. Heute ist der Uhrturm eine der letzten noch funktionierenden Monduhren der Erde, ein lebendiges Relikt einer osmanischen Welt, die Stunden anders maß.",
    },
    sl: {
      name: "Urna stolp",
      description: "Urni stolp iz 17. stoletja, ki še vedno teče po osmanskem lunarnem času",
      story:
        "Urni stolp stoji 25 metrov visoko v bližini mošeje Gazi Husrev-beg, zgrajen v začetku 17. stoletja kot del velikega osmanskega kompleksa, ki je definiral Baščaršijo. Kar ga loči od vsakega drugega ure na svetu, je način, kako meri čas: ne po soncu, temveč po Luni. Deluje po Alaturka času, sistemu, kjer vsak nov dan začne ob sončnem zahodu, zato mora biti ura vsak večer ročno nastavljena, ko se dolžina noči spreminja z letnimi časi. Skozi stoletja je namenski čuvaj časa — sahatćija — plezal po stolpu vsak mrak, da bi opravil ta obred. Danes je Urni stolp ena zadnjih delujočih lunarnih ur na Zemlji, živ ostanek osmanskega sveta, ki je ure meril drugače.",
    },
    it: {
      name: "Torre dell'Orologio",
      description: "Una torre dell'orologio del XVII secolo che funziona ancora secondo il tempo lunare ottomano",
      story:
        "La Torre dell'Orologio si erge alta 25 metri vicino alla Moschea di Gazi Husrev-beg, costruita all'inizio del XVII secolo come parte del grande complesso ottomano che definì la Baščaršija. Ciò che la rende diversa da qualsiasi altro orologio al mondo è il modo in cui segna il tempo: non secondo il sole, ma secondo la luna. Funziona secondo il tempo Alaturka, un sistema in cui ogni nuovo giorno inizia al tramonto, quindi l'orologio deve essere reimpostato manualmente ogni sera al variare della lunghezza della notte con le stagioni. Per secoli un guardiano del tempo dedicato — il sahatćija — saliva la torre ogni crepuscolo per eseguire questo rituale. Oggi la Torre dell'Orologio è uno degli ultimi orologi lunari funzionanti sulla Terra, una reliquia vivente di un mondo ottomano che misurava le ore diversamente.",
    },
    fr: {
      name: "Tour de l'Horloge",
      description: "Une tour de l'horloge du XVIIe siècle qui fonctionne encore selon l'heure lunaire ottomane",
      story:
        "La Tour de l'Horloge se dresse à 25 mètres de hauteur près de la mosquée Gazi Husrev-beg, construite au début du XVIIe siècle dans le cadre du grand complexe ottoman qui définissait la Baščaršija. Ce qui la distingue de toute autre horloge au monde, c'est sa façon de mesurer le temps : non pas selon le soleil, mais selon la lune. Elle fonctionne à l'heure Alaturka, un système où chaque nouveau jour commence au coucher du soleil, ce qui oblige à remettre l'horloge à l'heure manuellement chaque soir au gré des variations de la durée de la nuit selon les saisons. Pendant des siècles un gardien du temps dédié — le sahatćija — montait dans la tour chaque crépuscule pour accomplir ce rituel. Aujourd'hui la Tour de l'Horloge est l'une des dernières horloges lunaires fonctionnelles sur Terre, une relique vivante d'un monde ottoman qui mesurait les heures différemment.",
    },
    es: {
      name: "Torre del Reloj",
      description: "Una torre del reloj del siglo XVII que aún funciona con el tiempo lunar otomano",
      story:
        "La Torre del Reloj se alza 25 metros cerca de la Mezquita Gazi Husrev-beg, construida a principios del siglo XVII como parte del gran complejo otomano que definió la Baščaršija. Lo que la hace diferente a cualquier otro reloj del mundo es cómo mide el tiempo: no por el sol, sino por la luna. Funciona con la hora Alaturka, un sistema donde cada nuevo día comienza al atardecer, por lo que el reloj debe restablecerse manualmente cada noche mientras la duración de la noche cambia con las estaciones. Durante siglos un guardián del tiempo dedicado — el sahatćija — subía la torre cada anochecer para realizar este ritual. Hoy la Torre del Reloj es uno de los últimos relojes lunares en funcionamiento en la Tierra, una reliquia viva de un mundo otomano que medía las horas de manera diferente.",
    },
  },

  // ── 7 · Vječna Vatra ─────────────────────────────────────────────────────────
  "7": {
    bs: {
      name: "Vječna vatra",
      description: "Vječna vatra — Sarajevski neprekidni počast palim borcima",
      story:
        "Dana 6. aprila 1946. — tačno godinu dana nakon što je Sarajevo oslobođeno od nacističke okupacije — buktinja je zapaljena na onome što je sada Ferhadija ulica i od tada nije ugasla. Vječna vatra gori u sjećanje na vojnike i civile koji su poginuli tokom Drugog svjetskog rata. Preživjela je četverogodišnju opsadu Sarajeva od 1992. do 1995. godine, jednu od najdužih opsada glavnog grada u historiji modernog ratovanja. Kada je snabdijevanje gasom prekinuto tokom opsade i plamen je počeo da se gasi, građani su se skupili na ulicama da ga zaštite. Plamen je ponovo zapaljen rukom i održavan kroz rat. Ona nije samo spomenik — to je zavjet između grada i njegovih mrtvih, obnavljan svakog trenutka dok gori.",
    },
    tr: {
      name: "Ebedi Alev",
      description: "Ebedi Alev — Saraybosna'nın şehitlere kesintisiz saygı duruşu",
      story:
        "6 Nisan 1946'da — Saraybosna'nın Nazi işgalinden kurtarılmasının tam bir yıl dönümünde — bugün Ferhadija Caddesi olan yerde bir alev yakıldı ve o günden beri sönmedi. Ebedi Alev, İkinci Dünya Savaşı sırasında hayatını kaybeden askerler ve sivillerin anısına yanmaktadır. Modern savaş tarihinin en uzun başkent kuşatmalarından biri olan 1992'den 1995'e kadar süren dört yıllık Saraybosna kuşatmasını atlattı. Kuşatma sırasında gaz bağlantısı kesildiğinde ve alev sönmeye başladığında vatandaşlar onu korumak için sokaklarda toplandı. Alev elle yeniden yakılarak savaş boyunca söndürülmeden korundu. Bu yalnızca bir anıt değil — her yandığı anda yenilenen, şehirle ölüleri arasındaki bir ahittir.",
    },
    ar: {
      name: "الشعلة الأبدية",
      description: "الشعلة الأبدية — تكريم سراييفو المتواصل لضحاياها",
      story:
        "في 6 أبريل 1946 — بعد عام واحد بالتمام من تحرير سراييفو من الاحتلال النازي — أُضيءت شعلة في ما يُعرف الآن بشارع فرهادية ولم تنطفئ منذ ذلك الحين. تحترق الشعلة الأبدية في ذاكرة الجنود والمدنيين الذين ماتوا خلال الحرب العالمية الثانية. نجت من الحصار الرباعي لسراييفو من 1992 إلى 1995، أحد أطول حصارات عاصمة في تاريخ الحرب الحديثة. عندما قُطع إمداد الغاز خلال الحصار وبدأت الشعلة تتلاشى تجمع المواطنون في الشوارع لحمايتها. أُعيد إشعال الشعلة باليد وظلت تحترق طوال الحرب. إنها ليست مجرد نصب تذكاري — بل هي عهد بين المدينة وموتاها، يتجدد في كل لحظة تحترق فيها.",
    },
    de: {
      name: "Ewige Flamme",
      description: "Die Ewige Flamme — Sarajevos ungebrochene Hommage an die Gefallenen",
      story:
        "Am 6. April 1946 — genau ein Jahr nachdem Sarajevo von der Nazi-Besatzung befreit worden war — wurde auf der heutigen Ferhadija-Straße eine Flamme entzündet, die seitdem nicht mehr erloschen ist. Die Vječna Vatra, die Ewige Flamme, brennt im Gedenken an die Soldaten und Zivilisten, die im Zweiten Weltkrieg gestorben sind. Sie überlebte die vierjährige Belagerung Sarajevos von 1992 bis 1995, eine der längsten Belagerungen einer Hauptstadt in der Geschichte der modernen Kriegsführung. Als während der Belagerung die Gasversorgung unterbrochen wurde und die Flamme zu erlöschen begann, versammelten sich die Bürger auf den Straßen, um sie zu schützen. Die Flamme wurde von Hand neu entzündet und brannte durch den Krieg hindurch. Es ist nicht nur ein Denkmal — es ist ein Bündnis zwischen der Stadt und ihren Toten, erneuert in jedem Moment, in dem es brennt.",
    },
    sl: {
      name: "Večni plamen",
      description: "Večni plamen — Sarajevska nepretrgana počastitev padlih",
      story:
        "6. aprila 1946 — točno eno leto potem, ko je bilo Sarajevo osvobojeno izpod nacistične zasedbe — je bil na današnji Ferhadija ulici prižgan plamen, ki od takrat ni ugasnil. Vječna Vatra, Večni plamen, gori v spomin na vojake in civiliste, ki so umrli med drugo svetovno vojno. Preživelo je štiriletno obleganje Sarajeva od 1992 do 1995, eno najdaljših obleganj prestolnice v zgodovini sodobnega vojskovanja. Ko je med obleganjem prišlo do prekinitve oskrbe z zemeljskim plinom in se je plamen začel ugašati, so se meščani zbrali na ulicah, da bi ga zaščitili. Plamen so ročno prižgali znova in vzdrževali med celotno vojno. Ni le spomenik — je zaveza med mestom in njegovimi mrtvimi, obnovljena v vsakem trenutku, ko gori.",
    },
    it: {
      name: "Fiamma Eterna",
      description: "La Fiamma Eterna — il tributo ininterrotto di Sarajevo ai caduti",
      story:
        "Il 6 aprile 1946 — esattamente un anno dopo la liberazione di Sarajevo dall'occupazione nazista — fu accesa una fiamma su quella che oggi è Via Ferhadija e da allora non si è mai spenta. La Vječna Vatra, la Fiamma Eterna, arde in memoria dei soldati e dei civili morti durante la Seconda Guerra Mondiale. Sopravvisse all'assedio quadriennale di Sarajevo dal 1992 al 1995, uno degli assedi più lunghi di una capitale nella storia della guerra moderna. Quando durante l'assedio la fornitura di gas fu interrotta e la fiamma cominciò a spegnersi, i cittadini si radunarono per le strade per proteggerla. La fiamma fu riaccesa a mano e mantenuta accesa durante la guerra. Non è semplicemente un monumento — è un patto tra la città e i suoi morti, rinnovato ogni momento in cui brucia.",
    },
    fr: {
      name: "Flamme Éternelle",
      description: "La Flamme Éternelle — l'hommage ininterrompu de Sarajevo à ses morts",
      story:
        "Le 6 avril 1946 — un an jour pour jour après la libération de Sarajevo de l'occupation nazie — une flamme fut allumée sur ce qui est aujourd'hui la rue Ferhadija et ne s'est jamais éteinte depuis. La Vječna Vatra, la Flamme Éternelle, brûle en mémoire des soldats et des civils morts pendant la Seconde Guerre mondiale. Elle a survécu au siège de quatre ans de Sarajevo de 1992 à 1995, l'un des sièges les plus longs d'une capitale dans l'histoire de la guerre moderne. Lorsque pendant le siège l'approvisionnement en gaz fut coupé et que la flamme commença à s'éteindre, les citoyens se rassemblèrent dans les rues pour la protéger. La flamme fut rallumée à la main et maintenue allumée pendant toute la guerre. Ce n'est pas seulement un monument — c'est un pacte entre la ville et ses morts, renouvelé à chaque instant où elle brûle.",
    },
    es: {
      name: "Llama Eterna",
      description: "La Llama Eterna — el tributo ininterrumpido de Sarajevo a sus caídos",
      story:
        "El 6 de abril de 1946 — exactamente un año después de que Sarajevo fuera liberada de la ocupación nazi — se encendió una llama en lo que hoy es la calle Ferhadija y no se ha apagado desde entonces. La Vječna Vatra, la Llama Eterna, arde en memoria de los soldados y civiles que murieron durante la Segunda Guerra Mundial. Sobrevivió al asedio de cuatro años de Sarajevo de 1992 a 1995, uno de los asedios más largos de una capital en la historia de la guerra moderna. Cuando durante el asedio se cortó el suministro de gas y la llama comenzó a extinguirse, los ciudadanos se reunieron en las calles para protegerla. La llama fue reencendida a mano y mantenida ardiendo durante la guerra. No es simplemente un monumento — es un pacto entre la ciudad y sus muertos, renovado cada momento en que arde.",
    },
  },

  // ── 8 · Monument to the Murdered Children of Sarajevo ────────────────────────
  "8": {
    bs: {
      name: "Spomenik ubijenoj djeci opkoljenog Sarajeva",
      description: "Svečana počast 1.601 djetetu ubijenom tokom opsade",
      story:
        "Između aprila 1992. i februara 1996. Sarajevo je pretrpjelo najdužu opsadu ijednog glavnog grada u historiji modernog ratovanja. Među 13.952 dokumentiranih žrtava bilo je 1.601 dijete — neka su bila i dojenčad — ubijena snajperskom vatrom i granatama dok su se igrala, spavala ili išla u školu. Ovaj spomenik stoji kao vječni svjedok te istine. Podignut da počasti svako dijete po imenu, odbija utjehu apstraktnih brojeva. To nisu bile statistike — bila su to djeca s imenima, porodicama i budućnostima. Spomenik ne dopušta svijetu da zaboravi da su, među svim žrtvama opsade Sarajeva, najnezamjenjivije bile one najmlađe, čiji su glasovi utišani prije nego što su uopće počeli da zvuče.",
    },
    tr: {
      name: "Kuşatılmış Saraybosna'nın Katledilen Çocukları Anıtı",
      description: "Kuşatma sırasında hayatını kaybeden 1.601 çocuğa sessiz bir saygı duruşu",
      story:
        "Nisan 1992 ile Şubat 1996 arasında Saraybosna, modern savaş tarihinin en uzun başkent kuşatmasını yaşadı. Belgelenen 13.952 kurbanın arasında 1.601 çocuk vardı — bir kısmı henüz bebek yaştaydı — oyun oynarken, uyurken ya da okula giderken keskin nişancı ateşi ve havan toplarıyla hayatlarını kaybettiler. Saraybosna'nın Katledilen Çocukları Anıtı bu gerçeğin ebedi bir tanığı olarak durmaktadır. Her çocuğu ismiyle onurlandırmak için dikilmiş olan bu anıt, soyutlamanın rahatlatıcılığını reddeder. Bunlar istatistik değildi — isimleri, aileleri ve gelecekleri olan çocuklardı. Anıt, dünyanın unutmasına izin vermez: Saraybosna kuşatmasının tüm kayıpları arasında en telafi edilemez olanlar, sesleri henüz gerçek anlamda yükselmeden susturulan en küçük olanlarıydı.",
    },
    ar: {
      name: "نصب شهداء أطفال سراييفو المحاصرة",
      description: "تكريم صامت للـ 1601 طفل قُتلوا خلال الحصار",
      story:
        "بين أبريل 1992 وفبراير 1996، عاشت سراييفو أطول حصار لعاصمة في تاريخ الحروب الحديثة. من بين 13952 ضحية موثقة كان 1601 طفلاً — بعضهم رضّع — قُتلوا برصاص القناصة وقذائف الهاون وهم يلعبون أو ينامون أو يسيرون إلى مدارسهم. يقف هذا النصب شاهداً أبدياً على تلك الحقيقة. أُقيم تخليداً لذكرى كل طفل باسمه، رافضاً راحة التجريد والأرقام. لم يكونوا إحصاءات — كانوا أطفالاً لهم أسماء وعائلات ومستقبلات. لا يسمح النصب للعالم بأن ينسى أن أثمن ما فُقد خلال حصار سراييفو كان أصغر ضحاياه، الذين أُسكتت أصواتهم قبل أن تبدأ حقاً.",
    },
    de: {
      name: "Denkmal für die ermordeten Kinder des belagerten Sarajevo",
      description: "Ein stilles Gedenken an die 1.601 Kinder, die während der Belagerung getötet wurden",
      story:
        "Zwischen April 1992 und Februar 1996 erlebte Sarajevo die längste Belagerung einer Hauptstadt in der Geschichte der modernen Kriegsführung. Unter den 13.952 dokumentierten Opfern befanden sich 1.601 Kinder — einige noch Säuglinge — die durch Scharfschützenfeuer und Mörsergranaten getötet wurden, während sie spielten, schliefen oder zur Schule gingen. Das Denkmal für die ermordeten Kinder des belagerten Sarajevo steht als ewiger Zeuge dieser Wahrheit. Errichtet, um jedes Kind namentlich zu ehren, verweigert es den Trost der Abstraktion. Es waren keine Statistiken — es waren Kinder mit Namen, Familien und Zukunftsperspektiven. Das Denkmal lässt die Welt nicht vergessen, dass unter allen Verlusten der Belagerung Sarajevos die unersetzlichsten die jüngsten waren — diejenigen, deren Stimmen verstummt sind, bevor sie wirklich begonnen hatten.",
    },
    sl: {
      name: "Spomenik umorjenim otrokom obkoljenega Sarajeva",
      description: "Slovesna počastitev 1.601 otrok, ubitih med obleganjem",
      story:
        "Med aprilom 1992 in februarjem 1996 je Sarajevo prestalo najdaljše obleganje katerekoli prestolnice v zgodovini sodobnega vojskovanja. Med 13.952 dokumentiranimi žrtvami je bilo 1.601 otrok — nekateri še dojenčki — ubitih s streli ostrostrelcev in minometnimi projektili, medtem ko so se igrali, spali ali hodili v šolo. Ta spomenik stoji kot večni priča te resnice. Postavljen, da bi počastil vsakega otroka po imenu, zavrača tolažbo abstrakcije. Niso bili statistike — bili so otroci z imeni, družinami in prihodnostmi. Spomenik ne dovoli svetu, da pozabi: med vsemi izgubami sarajevskega obleganja so bile najnenadomestljive tiste najmlajše, katerih glasovi so bili utišani, preden so sploh resnično začeli zveneti.",
    },
    it: {
      name: "Monumento ai bambini assassinati di Sarajevo assediata",
      description: "Un solenne tributo ai 1.601 bambini uccisi durante l'assedio",
      story:
        "Tra l'aprile del 1992 e il febbraio del 1996, Sarajevo subì il più lungo assedio di qualsiasi capitale nella storia della guerra moderna. Tra le 13.952 vittime documentate c'erano 1.601 bambini — alcuni ancora in fasce — uccisi dal fuoco dei cecchini e dalle granate di mortaio mentre giocavano, dormivano o andavano a scuola. Il Monumento ai bambini assassinati di Sarajevo assediata si erge come eterno testimone di questa verità. Eretto per onorare ogni bambino per nome, rifiuta il conforto dell'astrazione. Non erano statistiche — erano bambini con nomi, famiglie e futuri. Il monumento non lascia che il mondo dimentichi: tra tutte le perdite dell'assedio di Sarajevo, le più insostituibili furono quelle dei più piccoli, le cui voci furono messe a tacere prima ancora di aver davvero cominciato.",
    },
    fr: {
      name: "Monument aux enfants assassinés de Sarajevo assiégée",
      description: "Un solennel hommage aux 1 601 enfants tués pendant le siège",
      story:
        "Entre avril 1992 et février 1996, Sarajevo a subi le plus long siège d'une capitale dans l'histoire de la guerre moderne. Parmi les 13 952 victimes documentées se trouvaient 1 601 enfants — certains encore nourrissons — tués par des tirs de snipers et des obus de mortier alors qu'ils jouaient, dormaient ou allaient à l'école. Le Monument aux enfants assassinés de Sarajevo assiégée se dresse comme un témoin perpétuel de cette vérité. Érigé pour honorer chaque enfant par son nom, il refuse le réconfort de l'abstraction. Ce n'étaient pas des statistiques — c'étaient des enfants avec des noms, des familles et des avenirs. Le monument ne laisse pas le monde oublier que parmi toutes les pertes du siège de Sarajevo, les plus irremplaçables furent ses plus jeunes victimes, dont les voix ont été réduites au silence avant qu'elles n'aient vraiment commencé.",
    },
    es: {
      name: "Monumento a los niños asesinados de Sarajevo sitiada",
      description: "Un solemne tributo a los 1.601 niños asesinados durante el asedio",
      story:
        "Entre abril de 1992 y febrero de 1996, Sarajevo sufrió el asedio más largo de cualquier capital en la historia de la guerra moderna. Entre las 13.952 víctimas documentadas había 1.601 niños — algunos todavía bebés — asesinados por fuego de francotiradores y granadas de mortero mientras jugaban, dormían o iban a la escuela. El Monumento a los niños asesinados de Sarajevo sitiada se yergue como testigo perpetuo de esa verdad. Erigido para honrar a cada niño por su nombre, rechaza el consuelo de la abstracción. No eran estadísticas — eran niños con nombres, familias y futuros. El monumento no deja que el mundo olvide que entre todas las pérdidas del asedio de Sarajevo, las más irreemplazables fueron las de sus más jóvenes víctimas, cuyas voces fueron silenciadas antes de que realmente hubieran comenzado.",
    },
  },

  // ── 9 · Multicultural Man ─────────────────────────────────────────────────────
  "9": {
    bs: {
      name: "Multikulturalni čovjek",
      description: "Brončani simbol identiteta Sarajeva kao susretišta svjetova",
      story:
        "Stojeći u srcu Sarajeva, skulptura Multikulturalnog čovjeka utjelovljuje najdublju istinu ovog grada: da nikada nije pripadao samo jednom narodu, jednoj vjeri ili jednoj kulturi. Sarajevo je jedan od rijetkih gradova na svijetu gdje džamija, katolička katedrala, pravoslavna crkva i sinagoga stoje udaljene svega nekoliko minuta jedna od druge — ne kao spomenici tolerancije, već kao živa mjesta bogoslužja koja vijekovima koegzistiraju. Lik Multikulturalnog čovjeka je umjetnički iskaz da taj suživot nije slučajan element Sarajevskog identiteta — on jeste njegov identitet. U gradu koji je preživio opsadu i odabrao da ostane otvoren, skulptura podsjeća da je ono što Sarajevo čini izvanrednim upravo ono što je ono oduvijek bilo: mjesto gdje razlika nije problem koji treba riješiti, već sama tekstura svakodnevnog života.",
    },
    tr: {
      name: "Çok Kültürlü Adam",
      description: "Saraybosna'nın dünyaların buluşma noktası kimliğinin bronz simgesi",
      story:
        "Saraybosna'nın kalbinde dikili duran Çok Kültürlü Adam heykeli, şehrin en kalıcı gerçeğini simgeler: Burasının hiçbir zaman yalnızca bir halka, bir inanca ya da bir kültüre ait olmadığını. Saraybosna, dünyada birbirinden birkaç dakika uzaklıkta bir caminin, bir Katolik katedralin, bir Ortodoks kilisesinin ve bir sinagogonun bir arada bulunduğu ender şehirlerden biridir; hem de bunlar hoşgörü anıtları olarak değil, yüzyıllardır yan yana süregelen canlı ibadet yerleri olarak. Çok Kültürlü Adam figürü, bu bir arada var oluşun Saraybosna'nın kimliğine tesadüfi bir katkı olmadığını, onun kimliğinin ta kendisi olduğunu ortaya koyan bir sanatsal ifadedir. Kuşatmayı atlatıp açık kalmayı seçen bu şehirde heykel, Saraybosna'yı olağanüstü kılan şeyin her zaman ne olduğunu hatırlatır: Farklılığın çözülmesi gereken bir sorun değil, gündelik hayatın dokusu olduğu bir yer.",
    },
    ar: {
      name: "الرجل المتعدد الثقافات",
      description: "رمز برونزي لهوية سراييفو بوصفها ملتقى العوالم",
      story:
        "يقف تمثال الرجل المتعدد الثقافات في قلب سراييفو ليجسّد أعمق حقيقة في هذه المدينة: أنها لم تنتمِ قط لشعب واحد أو دين واحد أو ثقافة واحدة. سراييفو واحدة من المدن النادرة في العالم التي تجمع بين مسجد وكاتدرائية كاثوليكية وكنيسة أرثوذكسية وكنيس يهودي على بعد دقائق من بعضها — ليس كشواهد على التسامح، بل كأماكن عبادة حية تعايشت لقرون. تمثال الرجل المتعدد الثقافات تعبير فني عن أن هذا التعايش ليس عَرَضياً في هوية سراييفو، بل هو هويتها بعينها. في مدينة نجت من الحصار واختارت أن تبقى منفتحة، يذكّرنا التمثال بأن ما يجعل سراييفو استثنائية هو ما كانت عليه دائماً: مكان لا تُعدّ فيه الاختلافات مشكلة تحتاج إلى حل، بل نسيج الحياة اليومية ذاتها.",
    },
    de: {
      name: "Multikultureller Mensch",
      description: "Ein bronzenes Symbol für Sarajevos Identität als Treffpunkt der Welten",
      story:
        "Die Skulptur des Multikulturellen Menschen, die im Herzen Sarajevos steht, verkörpert die dauerhafteste Wahrheit der Stadt: dass sie niemals nur einem Volk, einem Glauben oder einer Kultur gehört hat. Sarajevo ist eine der wenigen Städte der Welt, in der eine Moschee, eine katholische Kathedrale, eine orthodoxe Kirche und eine Synagoge im Abstand von wenigen Minuten voneinander stehen — nicht als Monumente der Toleranz, sondern als lebendige Gotteshäuser, die seit Jahrhunderten nebeneinander bestehen. Die Figur des Multikulturellen Menschen ist ein künstlerischer Ausdruck dafür, dass dieses Miteinander nicht zufällig zur Identität Sarajevos gehört — es ist seine Identität. In einer Stadt, die eine Belagerung überstand und sich entschied, offen zu bleiben, erinnert die Skulptur daran, was Sarajevo außergewöhnlich macht — genau das, was es schon immer war: ein Ort, an dem Verschiedenheit kein zu lösendes Problem ist, sondern die Textur des Alltags selbst.",
    },
    sl: {
      name: "Multikulturni človek",
      description: "Bronast simbol sarajevske identitete kot stičišča svetov",
      story:
        "Kip Multikulturnega človeka, ki stoji v srcu Sarajeva, pooseblja najbolj trajno resnico tega mesta: da nikoli ni pripadalo le enemu ljudstvu, eni veri ali eni kulturi. Sarajevo je eno redkih mest na svetu, kjer so mošeja, katoliška katedrala, pravoslavna cerkev in sinagoga oddaljene le nekaj minut hoje ena od druge — ne kot spomeniki strpnosti, ampak kot žive bogoslužne prostore, ki so soobstajali skozi stoletja. Podoba Multikulturnega človeka je umetniška izjava, da ta soobstoj ni naključen za identiteto Sarajeva — on je njegova identiteta. V mestu, ki je preživelo obleganje in se odločilo ostati odprto, kip spominja na to, kar Sarajevo dela izjemno — prav tisto, kar je vedno bilo: kraj, kjer razlika ni problem, ki ga je treba rešiti, ampak sama tekstura vsakdanjega življenja.",
    },
    it: {
      name: "Uomo Multiculturale",
      description: "Un simbolo bronzeo dell'identità di Sarajevo come crocevia di mondi",
      story:
        "La scultura dell'Uomo Multiculturale, che si erge nel cuore di Sarajevo, incarna la verità più duratura della città: che non è mai appartenuta a un solo popolo, una sola fede o una sola cultura. Sarajevo è una delle rare città al mondo dove una moschea, una cattedrale cattolica, una chiesa ortodossa e una sinagoga si trovano a pochi minuti l'una dall'altra — non come monumenti alla tolleranza, ma come luoghi di culto vivi che hanno coesistito per secoli. La figura dell'Uomo Multiculturale è un'affermazione artistica che questa coesistenza non è accidentale all'identità di Sarajevo — è la sua identità. In una città che ha sopravvissuto a un assedio e ha scelto di rimanere aperta, la scultura ricorda ciò che rende Sarajevo straordinaria — esattamente ciò che è sempre stata: un luogo dove la differenza non è un problema da risolvere, ma la texture stessa della vita quotidiana.",
    },
    fr: {
      name: "L'Homme Multiculturel",
      description: "Un symbole de bronze de l'identité de Sarajevo comme carrefour des mondes",
      story:
        "La sculpture de l'Homme Multiculturel, dressée au cœur de Sarajevo, incarne la vérité la plus durable de la ville : qu'elle n'a jamais appartenu qu'à un seul peuple, une seule foi ou une seule culture. Sarajevo est l'une des rares villes au monde où une mosquée, une cathédrale catholique, une église orthodoxe et une synagogue se trouvent à quelques minutes les unes des autres — non comme des monuments à la tolérance, mais comme des lieux de culte vivants qui ont coexisté pendant des siècles. La figure de l'Homme Multiculturel est une déclaration artistique que cette coexistence n'est pas accidentelle à l'identité de Sarajevo — elle est son identité. Dans une ville qui a survécu à un siège et choisi de rester ouverte, la sculpture rappelle ce qui rend Sarajevo extraordinaire — précisément ce qu'elle a toujours été : un endroit où la différence n'est pas un problème à résoudre, mais la texture même de la vie quotidienne.",
    },
    es: {
      name: "El Hombre Multicultural",
      description: "Un símbolo de bronce de la identidad de Sarajevo como cruce de mundos",
      story:
        "La escultura del Hombre Multicultural, que se alza en el corazón de Sarajevo, encarna la verdad más perdurable de la ciudad: que nunca ha pertenecido a un solo pueblo, una sola fe o una sola cultura. Sarajevo es una de las pocas ciudades del mundo donde una mezquita, una catedral católica, una iglesia ortodoxa y una sinagoga se encuentran a pocos minutos unas de otras — no como monumentos a la tolerancia, sino como lugares de culto vivos que han coexistido durante siglos. La figura del Hombre Multicultural es una declaración artística de que esta coexistencia no es accidental a la identidad de Sarajevo — es su identidad. En una ciudad que sobrevivió a un asedio y eligió permanecer abierta, la escultura recuerda lo que hace extraordinaria a Sarajevo — exactamente lo que siempre ha sido: un lugar donde la diferencia no es un problema a resolver, sino la textura misma de la vida cotidiana.",
    },
  },
};

// ── Lookup helper ─────────────────────────────────────────────────────────────

/**
 * Returns translated name/description/story for a location.
 * Falls back to the English defaults from locations.ts if no translation exists.
 */
export function getLocationContent(
  id: string,
  lang: LangCode,
  defaults: LocationContent,
  firebaseOverrides?: LocTranslationOverrides
): LocationContent {
  // Firebase admin override takes priority over hardcoded translations
  const fbOverride = firebaseOverrides?.[id]?.[lang];
  if (fbOverride) return fbOverride;
  return locationTranslations[id]?.[lang] ?? defaults;
}

// ── Firebase RTDB helpers ─────────────────────────────────────────────────────

/** Subscribe to real-time Firebase overrides for all location translations. */
export function subscribeLocationTranslations(
  cb: (data: LocTranslationOverrides) => void
): () => void {
  const r = ref(db, "locationTranslations");
  const unsub = onValue(r, (snap) => cb(snap.exists() ? (snap.val() as LocTranslationOverrides) : {}));
  return () => unsub();
}

/** Persist a single location+language translation to Firebase. */
export async function saveLocationTranslation(
  locId: string,
  lang: LangCode,
  content: LocationContent
): Promise<void> {
  await set(ref(db, `locationTranslations/${locId}/${lang}`), content);
}
