require 'csv'

locales = %w(NY CA TX WA)

rows = CSV.read("./cleveland.csv", headers: true)

locale_store = {"NY": {}, "CA": {}, "TX": {}, "WA": {}, "OH":{}}

FILE_NAMES = {"NY": "nyc", "CA": "los_angeles", "TX": "austin", "WA": "seattle", "OH": "cleveland"}

CONVERT_TO_METRIC = false

rows.each do |row|

  if CONVERT_TO_METRIC then
    %w(TMIN TMAX TAVG).each do |k|
      if not row[k].nil? and row[k].respond_to?(:to_f)
        row[k] = '%.2f' % ((row[k].to_f * (9.0 / 5.0)) + 32)
      end
    end
    if not row["PRCP"].nil?
      row["PRCP"] = '%.2f' % (row["PRCP"].to_f / 0.0393701)
    end
  end

  id = /, (.+?) US$/.match(row["NAME"])[1].to_sym

  if not locale_store[id].nil?
    locale_h = locale_store[id]
    date = row["DATE"]
    if locale_h[date].nil?
      locale_h[date] = row.to_h
    else 

      locale_store[id][date] = locale_h[date].merge(row.to_h){ |key, v1, v2| v1.to_s.empty?  ? v2 : v1 }

    end
  end
end



locale_store.select { |k,v| !v.empty? }.keys.each do |l|
  locale = l
  headers = locale_store[l].values[0].keys
  CSV.open("#{FILE_NAMES[locale]}_2017.csv", "w", headers: headers) do |csv|
    csv << headers
    rows = locale_store[l].values.sort_by! { |x| Date.parse x['DATE'] }
    rows.each do |d|
      csv << d
    end
  end
end
